import { useCompletePurchaseMutation } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import {
  connectAsync,
  getProductsAsync,
  IAPItemDetails,
  IAPResponseCode,
  setPurchaseListener,
  purchaseItemAsync,
  finishTransactionAsync,
} from 'expo-in-app-purchases';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import { getPlatform } from '../components/utils';
import { useUserContext } from './UserContext';
import { trackEvent } from './AppContext';

export interface TPurchaseContext {
  products: IAPItemDetails[];
  productLoadStatus: ProductLoadStatus;
  purchase: (product: IAPItemDetails) => Promise<void>;
  purchasing: boolean;
}

const items =
  Platform.select({
    ios: ['premium.monthly.v1'],
    android: ['premium.monthly.v1'],
  }) ?? [];

type ProductLoadStatus = 'loading' | 'loaded' | 'error';

export const PurchaseContext = createContext({} as TPurchaseContext);

export const PurchaseContextProvider: React.FC = ({ children }) => {
  const { user, actions } = useUserContext();

  const purchasingProduct = useRef<IAPItemDetails>();
  const [products, setProducts] = useState<IAPItemDetails[]>([]);
  const [productLoadStatus, setProductLoadStatus] = useState<ProductLoadStatus>(
    'loading',
  );
  const [purchasing, setPurchasing] = useState(false);

  const [, executeCompletePurchase] = useCompletePurchaseMutation();

  useEffect(() => {
    fetchProducts();

    async function fetchProducts() {
      try {
        await connectAsync();
        const { responseCode, results } = await getProductsAsync(items);
        if (responseCode === IAPResponseCode.OK && results) {
          if (results) {
            setProducts(results);
            setProductLoadStatus('loaded');
            return results;
          } else {
            trackEvent('Product Load Error', {
              error: 'Error loading products',
              responseCode: responseCode.toString(),
            });
            console.error(responseCode);
            setProductLoadStatus('error');
          }
        } else {
          trackEvent('Product Load Error', {
            error: 'Invalid response code from getProductsAsync',
            responseCode: responseCode.toString(),
          });
          throw new Error(
            'Invalid response code from getProductsAsync ' + responseCode,
          );
        }
      } catch (e) {
        trackEvent('Product Load Error', {
          error: 'Error loading products',
          message: e instanceof Error ? e.message : '',
        });
        console.error(e);
        setProductLoadStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    listenForPurchases();

    async function listenForPurchases() {
      setPurchaseListener(async ({ responseCode, results, errorCode }) => {
        if (responseCode === IAPResponseCode.OK) {
          const purchase = results?.find(
            (result) => result.acknowledged === false,
          );
          if (!purchase || !purchasingProduct.current || !('idToken' in user)) {
            setPurchasing(false);
            trackEvent('Purchase Error', {
              error: 'Error finding purchase',
              user: JSON.stringify(user),
            });
            throw new Error('invariant');
          }

          if (!purchase.acknowledged) {
            try {
              const result = await executeCompletePurchase(
                {
                  input: {
                    platform: getPlatform(Platform.OS),
                    receipt:
                      purchase.transactionReceipt ??
                      purchase.purchaseToken ??
                      '',
                    priceCents:
                      purchasingProduct.current.priceAmountMicros / 10000,
                  },
                },
                {
                  fetchOptions: {
                    headers: {
                      authorization: 'Bearer ' + user.idToken,
                    },
                  },
                },
              );

              purchasingProduct.current = undefined;
              if (
                !result.data ||
                result.data.completePurchase.isComplete === false ||
                !result.data.completePurchase.user
              ) {
                setPurchasing(false);
                trackEvent('Purchase Error', {
                  error: 'Error recording purchase',
                  message: result.error?.message || '',
                });
                throw new Error('Error recording purchase');
              }
              actions.purchaseComplete(result.data.completePurchase.user);

              finishTransactionAsync(purchase, false)
                .then((resp) => {
                  console.log('Finished transaction', resp);
                  setPurchasing(false);
                })
                .catch((e) => {
                  trackEvent('Purchase Error', {
                    error: 'Error finishing transaction',
                    message: e instanceof Error ? e.message : e,
                  });
                  return console.error('Error finishing transaction', e);
                });

              trackEvent('Purchase Completed');
            } catch (e) {
              trackEvent('Purchase Error', {
                error: e instanceof Error ? e.message : '',
              });
              console.error(e);
            }
          } else {
            setPurchasing(false);
          }
        } else if (responseCode === IAPResponseCode.USER_CANCELED) {
          console.log('User canceled the transaction');
          setPurchasing(false);
        } else if (responseCode === IAPResponseCode.DEFERRED) {
          console.log(
            'User does not have permissions to buy but requested parental approval (iOS only)',
          );
          setPurchasing(false);
        } else {
          trackEvent('Purchase Error', {
            errorCode: errorCode?.toString() ?? '',
          });
          console.warn(
            `Something went wrong with the purchase. Received errorCode ${errorCode}`,
          );
          setPurchasing(false);
        }
      });
    }
  }, [actions, executeCompletePurchase, user]);

  const purchase = useCallback(async (product: IAPItemDetails) => {
    setPurchasing(true);
    purchasingProduct.current = product;
    return purchaseItemAsync(product.productId);
  }, []);

  const providerValue: TPurchaseContext = useMemo(
    () => ({
      products,
      productLoadStatus,
      purchase,
      purchasing,
    }),
    [products, productLoadStatus, purchase, purchasing],
  );

  return (
    <PurchaseContext.Provider value={providerValue}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchaseContext = () => useContext(PurchaseContext);

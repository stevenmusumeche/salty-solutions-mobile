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
    // fetch products
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
            console.error(responseCode);
            setProductLoadStatus('error');
          }
        } else {
          throw new Error(
            'Invalid response code from getProductsAsync ' + responseCode,
          );
        }
      } catch (e) {
        console.error(e);
        setProductLoadStatus('error');
      }
    }

    // todo: add analytics events
    async function listenForPurchases() {
      setPurchaseListener(async ({ responseCode, results, errorCode }) => {
        if (responseCode === IAPResponseCode.OK) {
          const purchase = results?.find(
            (result) => result.acknowledged === false,
          );
          if (!purchase || !purchasingProduct.current || !('idToken' in user)) {
            // todo
            setPurchasing(false);
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
                throw new Error('Error recording purchase');
              }
              actions.purchaseComplete(result.data.completePurchase.user);

              // todo: show some UI

              finishTransactionAsync(purchase, true)
                .then((resp) => {
                  console.log('Finished transaction', resp);
                  setPurchasing(false);
                })
                .catch((e) => console.error('Error finishing transaction', e));
            } catch (e) {
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
          console.warn(
            `Something went wrong with the purchase. Received errorCode ${errorCode}`,
          );
          setPurchasing(false);
        }
      });
    }

    fetchProducts();
    listenForPurchases();
  }, [actions, executeCompletePurchase, user]);

  const purchase = useCallback(async (product: IAPItemDetails) => {
    console.log('try to purchase');
    // todo: show spinner
    setPurchasing(true);
    purchasingProduct.current = product;
    return purchaseItemAsync(product.productId);
  }, []);

  const providerValue: TPurchaseContext = useMemo(
    () => ({ products, productLoadStatus, purchase, purchasing }),
    [products, productLoadStatus, purchase, purchasing],
  );

  return (
    <PurchaseContext.Provider value={providerValue}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchaseContext = () => useContext(PurchaseContext);

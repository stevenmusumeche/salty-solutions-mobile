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
  useState,
} from 'react';
import { Platform } from 'react-native';

export interface TPurchaseContext {
  products: IAPItemDetails[];
  productLoadStatus: ProductLoadStatus;
  purchase: (product: IAPItemDetails) => Promise<void>;
}

const items =
  Platform.select({
    ios: ['premium.monthly.v1'],
    android: [],
  }) ?? [];

type ProductLoadStatus = 'loading' | 'loaded' | 'error';

export const PurchaseContext = createContext({} as TPurchaseContext);

export const PurchaseContextProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<IAPItemDetails[]>([]);
  const [productLoadStatus, setProductLoadStatus] = useState<ProductLoadStatus>(
    'loading',
  );

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
          } else {
            setProductLoadStatus('error');
          }
        }
      } catch (e) {
        setProductLoadStatus('error');
      }
    }

    async function listenForPurchases() {
      // Set purchase listener
      setPurchaseListener(({ responseCode, results, errorCode }) => {
        // Purchase was successful
        if (responseCode === IAPResponseCode.OK) {
          (results ?? []).forEach((purchase) => {
            if (!purchase.acknowledged) {
              console.log(`Successfully purchased ${purchase.productId}`);
              // todo: Process transaction here and unlock content...
              // todo: Make sure that you verify each purchase to prevent faulty transactions and protect against fraud BEFORE calling finishTransactionAsync
              // https://developer.apple.com/documentation/appstorereceipts/verifyreceipt

              finishTransactionAsync(purchase, true).catch((e) =>
                console.error(e),
              );
            }
          });
        } else if (responseCode === IAPResponseCode.USER_CANCELED) {
          console.log('User canceled the transaction');
        } else if (responseCode === IAPResponseCode.DEFERRED) {
          console.log(
            'User does not have permissions to buy but requested parental approval (iOS only)',
          );
        } else {
          console.warn(
            `Something went wrong with the purchase. Received errorCode ${errorCode}`,
          );
        }
      });
    }

    // todo: You should not call this method on launch because restoring purchases on iOS prompts for the user’s App Store credentials, which could interrupt the flow of your app.
    // async function fetchUserPurchases() {
    //   await connectAsync();
    //   const result = await getPurchaseHistoryAsync();

    //   console.log(result);
    // }

    fetchProducts();
    listenForPurchases();
    // fetchUserPurchases();
  }, []);

  const purchase = useCallback(async (product: IAPItemDetails) => {
    console.log('try to purchase', product);
    return purchaseItemAsync(product.productId);
  }, []);

  const providerValue: TPurchaseContext = useMemo(
    () => ({ products, productLoadStatus, purchase }),
    [products, productLoadStatus, purchase],
  );

  return (
    <PurchaseContext.Provider value={providerValue}>
      {children}
    </PurchaseContext.Provider>
  );
};

export const usePurchaseContext = () => useContext(PurchaseContext);

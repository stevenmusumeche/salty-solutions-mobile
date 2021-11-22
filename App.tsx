import React from 'react';
import { createClient, Provider } from 'urql';
import AppNavigation from './AppNavigation';
import { AppContextProvider } from './context/AppContext';
import { AppVersionContextProvider } from './context/AppVersionContext';
import { PurchaseContextProvider } from './context/PurchaseContext';
import { UserContextProvider } from './context/UserContext';

const client = createClient({
  url: 'https://o2hlpsp9ac.execute-api.us-east-1.amazonaws.com/prod/api',
});

const App = () => {
  return (
    <Provider value={client}>
      <UserContextProvider>
        <AppVersionContextProvider>
          <AppContextProvider>
            <PurchaseContextProvider>
              <AppNavigation />
            </PurchaseContextProvider>
          </AppContextProvider>
        </AppVersionContextProvider>
      </UserContextProvider>
    </Provider>
  );
};

export default App;

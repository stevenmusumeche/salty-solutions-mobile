import React from 'react';
import { createClient, Provider } from 'urql';
import AppNavigation from './AppNavigation';
import { AppContextProvider } from './context/AppContext';
import { AppVersionContextProvider } from './context/AppVersionContext';
import { PurchaseContextProvider } from './context/PurchaseContext';
import { UserContextProvider } from './context/UserContext';
import { FeatureFlagProvider } from '@stevenmusumeche/salty-solutions-shared';
import { Platform as RNPlatform, LogBox } from 'react-native';
import { getPlatform } from './components/utils';

const client = createClient({
  url: 'https://o2hlpsp9ac.execute-api.us-east-1.amazonaws.com/prod/api',
  // url: 'https://li0rnckwp5.execute-api.us-east-1.amazonaws.com/dev/api',
});

LogBox.ignoreLogs(['Setting a timer']);

const App = () => {
  return (
    <Provider value={client}>
      <FeatureFlagProvider platform={getPlatform(RNPlatform.OS)}>
        <UserContextProvider>
          <AppVersionContextProvider>
            <AppContextProvider>
              <PurchaseContextProvider>
                <AppNavigation />
              </PurchaseContextProvider>
            </AppContextProvider>
          </AppVersionContextProvider>
        </UserContextProvider>
      </FeatureFlagProvider>
    </Provider>
  );
};

export default App;

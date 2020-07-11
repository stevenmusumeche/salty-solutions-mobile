import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StatusBar } from 'react-native';
import { createClient, Provider } from 'urql';
import { AppContextProvider } from './context/AppContext';
import AppScreen from './screens/AppScreen';
import ChangeLocationScreen from './screens/ChangeLocationScreen';
import { gray, white } from './colors';
import { AppVersionContextProvider } from './context/AppVersionContext';

const client = createClient({
  url: 'https://o2hlpsp9ac.execute-api.us-east-1.amazonaws.com/prod/api',
});

const RootStack = createStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: gray[300],
    card: gray[800],
    text: white,
  },
};

const App = () => {
  return (
    <Provider value={client}>
      <AppVersionContextProvider>
        <AppContextProvider>
          <NavigationContainer theme={MyTheme}>
            <StatusBar barStyle="light-content" />
            <RootStack.Navigator
              mode="modal"
              screenOptions={{ headerShown: false }}
            >
              <RootStack.Screen name="App" component={AppScreen} />
              <RootStack.Screen
                name="ChangeLocation"
                component={ChangeLocationScreen}
              />
            </RootStack.Navigator>
          </NavigationContainer>
        </AppContextProvider>
      </AppVersionContextProvider>
    </Provider>
  );
};

export default App;

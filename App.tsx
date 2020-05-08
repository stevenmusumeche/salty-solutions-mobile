import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StatusBar } from 'react-native';
import { createClient, Provider } from 'urql';
import { AppContextProvider } from './context/AppContext';
import AppScreen from './screens/AppScreen';
import ChangeLocationScreen from './screens/ChangeLocationScreen';

const client = createClient({
  url: 'https://o2hlpsp9ac.execute-api.us-east-1.amazonaws.com/prod/api',
});

const RootStack = createStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#e2e8f0',
    card: '#2d3748',
    text: 'white',
  },
};

const App = () => {
  return (
    <Provider value={client}>
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
    </Provider>
  );
};

export default App;

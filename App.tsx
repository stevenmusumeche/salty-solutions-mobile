import {
  DefaultTheme,
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { trackEvent } from 'appcenter-analytics';
import React, { useRef } from 'react';
import { StatusBar } from 'react-native';
import { createClient, Provider } from 'urql';
import { brandYellow, gray, white } from './colors';
import { AppContextProvider } from './context/AppContext';
import { AppVersionContextProvider } from './context/AppVersionContext';
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
    background: gray[300],
    card: gray[800],
    text: white,
  },
};

const App = () => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string>();

  return (
    <Provider value={client}>
      <AppVersionContextProvider>
        <AppContextProvider>
          <NavigationContainer
            theme={MyTheme}
            ref={navigationRef}
            onReady={() => {
              const routeName = navigationRef.getCurrentRoute()?.name;
              if (routeName) {
                routeNameRef.current = routeName;
              }
            }}
            onStateChange={async () => {
              const previousRouteName = routeNameRef.current;
              const currentRouteName = navigationRef.getCurrentRoute()?.name;

              if (currentRouteName && previousRouteName !== currentRouteName) {
                trackEvent('Navigation', { route: currentRouteName });
              }

              // Save the current route name for later comparison
              routeNameRef.current = currentRouteName;
            }}
          >
            <StatusBar barStyle="light-content" />
            <RootStack.Navigator
              screenOptions={{ headerShown: false, presentation: 'card' }}
            >
              <RootStack.Screen name="App" component={AppScreen} />
              <RootStack.Screen
                name="ChangeLocation"
                component={ChangeLocationScreen}
                options={{
                  title: 'Change Location',
                  headerShown: true,
                  headerTitleStyle: { color: white },
                  headerTintColor: brandYellow,
                }}
              />
            </RootStack.Navigator>
          </NavigationContainer>
        </AppContextProvider>
      </AppVersionContextProvider>
    </Provider>
  );
};

export default App;

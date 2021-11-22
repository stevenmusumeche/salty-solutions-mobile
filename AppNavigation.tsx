import {
  DefaultTheme,
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useRef } from 'react';
import { StatusBar } from 'react-native';
import { brandYellow, gray, white } from './colors';
import { trackEvent } from './context/AppContext';
import { useUserContext } from './context/UserContext';
import AppScreen from './screens/AppScreen';
import ChangeLocationScreen from './screens/ChangeLocationScreen';
import LoginScreen from './screens/LoginScreen';
import SettingsScreen from './screens/SettingsScreen';

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

const AppNavigation: React.FC = () => {
  const navigationRef = useNavigationContainerRef();
  const routeNameRef = useRef<string>();
  const { user } = useUserContext();

  return (
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
        {!user.isLoggedIn ? (
          <RootStack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
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
            <RootStack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: 'Salty Solutions',
                headerShown: true,
                headerTitleStyle: { color: white },
                headerTintColor: brandYellow,
                headerBackTitle: 'Back',
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;

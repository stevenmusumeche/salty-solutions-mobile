import {
  DefaultTheme,
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useRef } from 'react';
import { StatusBar } from 'react-native';
import { brandYellow, gray, white } from './colors';
import FullScreenLoading from './components/FullScreenLoading';
import { trackEvent } from './context/AppContext';
import { usePurchaseContext } from './context/PurchaseContext';
import { useUserContext } from './context/UserContext';
import AppScreen from './screens/AppScreen';
import ChangeLocationScreen from './screens/ChangeLocationScreen';
import LoginScreen from './screens/LoginScreen';
import SettingsScreen from './screens/SettingsScreen';
import { useFeatureFlagContext } from '@stevenmusumeche/salty-solutions-shared';
import SolunarMarketingScreen from './screens/SolunarMarketingScreen';
import { ContactScreen } from './screens/ContactScreen';

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
  const { productLoadStatus } = usePurchaseContext();
  const { user } = useUserContext();
  const { state: flagState } = useFeatureFlagContext();

  let content;
  if (
    productLoadStatus === 'loading' ||
    user.loading ||
    flagState.status === 'loading'
  ) {
    content = (
      <RootStack.Screen
        name="GlobalLoading"
        component={FullScreenLoading}
        options={{ animationEnabled: false }}
      />
    );
  } else if ('error' in user) {
    content = (
      <RootStack.Screen
        name="GlobalError"
        component={FullScreenLoading}
        initialParams={{ error: user.error }}
        options={{ animationEnabled: false }}
      />
    );
  } else if (!user.isLoggedIn) {
    content = (
      <>
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animationEnabled: false }}
        />
        {ContactScreenContainer}
      </>
    );
  } else {
    content = (
      <>
        <RootStack.Screen
          name="App"
          component={AppScreen}
          options={{ animationEnabled: false }}
        />
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
        <RootStack.Screen
          name="SolunarMarketing"
          component={SolunarMarketingScreen}
          options={{
            title: 'Salty Solutions',
            headerShown: true,
            headerTitleStyle: { color: white },
            headerTintColor: brandYellow,
            headerBackTitle: 'Back',
          }}
        />
        {ContactScreenContainer}
      </>
    );
  }

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
        {content}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;

const ContactScreenContainer = (
  <RootStack.Screen
    name="Contact"
    component={ContactScreen}
    options={{
      title: 'Contact Salty Solutions',
      headerShown: true,
      headerTitleStyle: { color: white },
      headerTintColor: brandYellow,
      headerBackTitle: 'Back',
    }}
  />
);

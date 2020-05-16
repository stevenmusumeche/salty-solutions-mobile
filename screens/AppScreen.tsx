import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import NowScreen from './NowScreen';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocationSwitcher } from '../hooks/use-location-switcher';
import { useHeaderTitle } from '../hooks/use-header-title';
import { AppContext } from '../context/AppContext';
import ForecastScreen from './ForecastScreen';
import { AppLoading } from 'expo';
import TideScreen from './TideScreen';
import SatelliteScreen from './SatelliteScreen';

const AppTabs = createBottomTabNavigator();
const StubStack = createStackNavigator();

const Stub = () => {
  useLocationSwitcher();
  useHeaderTitle('Stub');
  return (
    <View>
      <Text>Stub</Text>
    </View>
  );
};

const StubScreen = () => {
  return (
    <StubStack.Navigator>
      <StubStack.Screen name="Stub" component={Stub} />
    </StubStack.Navigator>
  );
};

const AppScreen = () => {
  const { activeLocation } = useContext(AppContext);

  if (!activeLocation) {
    return <AppLoading />;
  }

  return (
    <AppTabs.Navigator
      tabBarOptions={{
        activeTintColor: '#fec857',
        inactiveTintColor: 'white',
      }}
    >
      <AppTabs.Screen
        name="Now"
        component={NowScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="today" size={size} color={color} />
          ),
        }}
      />
      <AppTabs.Screen
        name="Tides"
        component={TideScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="chart-line"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <AppTabs.Screen
        name="Forecast"
        component={ForecastScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="weather-cloudy"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <AppTabs.Screen
        name="Satellite"
        component={SatelliteScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="map-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
      {/* <AppTabs.Screen
        name="Salinity Map"
        component={StubScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="radar" size={size} color={color} />
          ),
        }}
      /> */}
    </AppTabs.Navigator>
  );
};

export default AppScreen;

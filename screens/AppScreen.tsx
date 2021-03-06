import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppLoading } from 'expo';
import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ForecastScreen from './ForecastScreen';
import NowScreen from './NowScreen';
import SalinityScreen from './SalinityScreen';
import SatelliteScreen from './SatelliteScreen';
import TideScreen from './TideScreen';
import { brandYellow, white } from '../colors';

const AppTabs = createBottomTabNavigator();

const AppScreen = () => {
  const { activeLocation } = useContext(AppContext);

  if (!activeLocation) {
    return <AppLoading />;
  }

  return (
    <AppTabs.Navigator
      tabBarOptions={{
        activeTintColor: brandYellow,
        inactiveTintColor: white,
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
      <AppTabs.Screen
        name="Salinity"
        component={SalinityScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="molecule" size={size} color={color} />
          ),
        }}
      />
    </AppTabs.Navigator>
  );
};

export default AppScreen;

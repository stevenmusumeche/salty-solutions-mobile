import { createStackNavigator } from '@react-navigation/stack';
import { UsgsParam } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import AirTempCard from '../components/AirTempCard';
import CardGrid from '../components/CardGrid';
import SalinityCard from '../components/SalinityCard';
import WaterTempCard from '../components/WaterTempCard';
import WindCard from '../components/WindCard';
import { AppContext } from '../context/AppContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';

const NowStack = createStackNavigator();

const Now: React.FC = () => {
  useLocationSwitcher();
  useHeaderTitle('Current Conditions');

  const { activeLocation } = useContext(AppContext);

  // todo: pull to refresh

  return (
    <View style={styles.container}>
      <ScrollView>
        <CardGrid>
          <WindCard />
          <AirTempCard />
          <WaterTempCard
            usgsSites={activeLocation.usgsSites.filter((site) =>
              site.availableParams.includes(UsgsParam.WaterTemp),
            )}
          />
          <SalinityCard
            usgsSites={activeLocation.usgsSites.filter((site) =>
              site.availableParams.includes(UsgsParam.Salinity),
            )}
          />
        </CardGrid>
      </ScrollView>
    </View>
  );
};

const NowScreen = () => (
  <NowStack.Navigator>
    <NowStack.Screen name="Current Conditions" component={Now} />
  </NowStack.Navigator>
);

export default NowScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
  },
});

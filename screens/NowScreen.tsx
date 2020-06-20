import { createStackNavigator } from '@react-navigation/stack';
import { UsgsParam } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import React, { useContext, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, View, RefreshControl } from 'react-native';
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
  const [requestRefresh, setRequestRefresh] = useState(false);

  const makeRefreshRequest = () => {
    setRequestRefresh(true);
    Promise.resolve().then(() => setRequestRefresh(false));
  };

  const waterTempSites = useMemo(
    () =>
      activeLocation.usgsSites.filter((site) =>
        site.availableParams.includes(UsgsParam.WaterTemp),
      ),
    [activeLocation.usgsSites],
  );

  const salinitySites = useMemo(
    () =>
      activeLocation.usgsSites.filter((site) =>
        site.availableParams.includes(UsgsParam.Salinity),
      ),
    [activeLocation.usgsSites],
  );

  const windSites = useMemo(
    () =>
      activeLocation.usgsSites.filter((site) =>
        site.availableParams.includes(UsgsParam.WindSpeed),
      ),
    [activeLocation.usgsSites],
  );

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={makeRefreshRequest} />
        }
      >
        <CardGrid>
          <WindCard requestRefresh={requestRefresh} usgsSites={windSites} />
          <AirTempCard requestRefresh={requestRefresh} />
          <WaterTempCard
            usgsSites={waterTempSites}
            requestRefresh={requestRefresh}
          />
          <SalinityCard
            usgsSites={salinitySites}
            requestRefresh={requestRefresh}
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

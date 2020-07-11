import { createStackNavigator } from '@react-navigation/stack';
import {
  TideStationDetailFragment,
  UsgsSiteDetailFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import {
  useSalinitySites,
  useWaterTempSites,
  useWindSites,
} from '@stevenmusumeche/salty-solutions-shared/dist/hooks';
import React, { useContext, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import AirTempCard from '../components/AirTempCard';
import CardGrid from '../components/CardGrid';
import SalinityCard from '../components/SalinityCard';
import UpgradeNotice from '../components/UpgradeNotice';
import WaterTempCard from '../components/WaterTempCard';
import WindCard from '../components/WindCard';
import { AppContext } from '../context/AppContext';
import { useAppVersionContext } from '../context/AppVersionContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';

const NowStack = createStackNavigator();

export type DataSite = UsgsSiteDetailFragment | TideStationDetailFragment;

const Now: React.FC = () => {
  useLocationSwitcher();
  useHeaderTitle('Current Conditions');

  const { activeLocation } = useContext(AppContext);
  const { newVersionAvailable } = useAppVersionContext();
  const [requestRefresh, setRequestRefresh] = useState(false);

  const makeRefreshRequest = () => {
    setRequestRefresh(true);
    Promise.resolve().then(() => setRequestRefresh(false));
  };

  const salinitySites = useSalinitySites(activeLocation);
  const waterTempSites = useWaterTempSites(activeLocation);
  const windSites = useWindSites(activeLocation);

  return (
    <>
      {newVersionAvailable && <UpgradeNotice />}
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={makeRefreshRequest} />
          }
        >
          <CardGrid>
            <WindCard requestRefresh={requestRefresh} sites={windSites} />
            <AirTempCard requestRefresh={requestRefresh} />
            <WaterTempCard
              sites={waterTempSites}
              requestRefresh={requestRefresh}
            />
            <SalinityCard
              sites={salinitySites}
              requestRefresh={requestRefresh}
            />
          </CardGrid>
        </ScrollView>
      </View>
    </>
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

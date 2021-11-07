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
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  Platform,
  Button,
} from 'react-native';
import { brandYellow, white } from '../colors';
import AirTempCard from '../components/AirTempCard';
import CardGrid from '../components/CardGrid';
import FullScreenGraph from '../components/FullScreenGraph';
import SalinityCard from '../components/SalinityCard';
import UpgradeNotice from '../components/UpgradeNotice';
import WaterTempCard from '../components/WaterTempCard';
import WindCard from '../components/WindCard';
import { AppContext, trackEvent } from '../context/AppContext';
import { useAppVersionContext } from '../context/AppVersionContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';
import * as StoreReview from 'expo-store-review';
import { useEffect } from 'react';
import { usePurchaseContext } from '../context/PurchaseContext';

export type NowStackParams = {
  FullScreenGraph: {
    title: string;
    siteName?: string;
    data: {
      y: number;
      x: string;
      [other: string]: any;
    }[];
    includeArrows?: boolean;
  };
};
const NowStack = createStackNavigator();

export type DataSite = UsgsSiteDetailFragment | TideStationDetailFragment;

const Now: React.FC = () => {
  const { products, purchase } = usePurchaseContext();
  useLocationSwitcher();
  useHeaderTitle();

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

  useEffect(() => {
    if (!__DEV__ && Platform.OS === 'ios') {
      const timer = setTimeout(() => {
        try {
          trackEvent('Review Requested', { os: Platform.OS });
          StoreReview.requestReview();
        } catch (e) {
          // ignore
        }
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {newVersionAvailable && <UpgradeNotice />}
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={makeRefreshRequest} />
          }
        >
          <Button onPress={() => purchase(products[0])} title="Buy" />
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
    <NowStack.Screen
      name="FullScreenGraph"
      component={FullScreenGraph}
      options={() => {
        return {
          headerTitleStyle: { color: white, fontSize: 17 },
          headerTintColor: brandYellow,
        };
      }}
    />
  </NowStack.Navigator>
);

export default NowScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
  },
});

import { createStackNavigator } from '@react-navigation/stack';
import { useCombinedForecastV2Query } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { addDays, endOfDay, format, startOfDay } from 'date-fns';
import React, { useCallback, useContext, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import ForecastCard, { styles as cardStyles } from '../components/ForecastCard';
import FullScreenError from '../components/FullScreenError';
import LoaderBlock from '../components/LoaderBlock';
import { AppContext } from '../context/AppContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';
import { ISO_FORMAT } from './TideScreen';

const NUM_DAYS = 9;

const ForecastStack = createStackNavigator();

const Forecast: React.FC = () => {
  useLocationSwitcher();
  useHeaderTitle('Forecast');

  const [refreshing, setRefreshing] = React.useState(false);
  const { activeLocation } = useContext(AppContext);

  const [forecast, refresh] = useCombinedForecastV2Query({
    variables: {
      locationId: activeLocation.id,
      startDate: format(startOfDay(new Date()), ISO_FORMAT),
      endDate: format(addDays(endOfDay(new Date()), NUM_DAYS), ISO_FORMAT),
    },
  });
  let data =
    forecast.data?.location?.combinedForecastV2?.slice(0, NUM_DAYS) || [];

  let sunData = forecast.data?.location?.sun || [];
  let tideData = forecast.data?.location?.tidePreditionStations[0]?.tides || [];
  let tideStationName =
    forecast.data?.location?.tidePreditionStations[0].name || '';

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh({ requestPolicy: 'network-only' });
  }, [refresh]);

  useEffect(() => {
    if (refreshing && !forecast.fetching) {
      setRefreshing(false);
    }
  }, [refreshing, forecast.fetching]);

  let stuffToRender;
  if (forecast.fetching) {
    stuffToRender = (
      <>
        <ForecastLoaderCard />
        <ForecastLoaderCard />
        <ForecastLoaderCard />
      </>
    );
  } else if (forecast.error && !data) {
    stuffToRender = <FullScreenError />;
  } else {
    stuffToRender =
      data &&
      data.map((datum) => {
        const date = new Date(datum.date);
        return (
          <ForecastCard
            key={datum.name}
            datum={datum}
            sunData={sunData}
            tideData={tideData}
            tideStationName={tideStationName}
            date={date}
          />
        );
      });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {stuffToRender}
      </ScrollView>
    </View>
  );
};

const ForecastLoaderCard = () => (
  <View style={cardStyles.container}>
    <View style={cardStyles.cardWrapper}>
      <View style={cardStyles.header}>
        <LoaderBlock styles={styles.loaderBlockHeader} />
      </View>
      <View style={[cardStyles.children, { padding: 15 }]}>
        <LoaderBlock styles={styles.loaderBlockBody} />
      </View>
    </View>
  </View>
);

const ForecastScreen = () => (
  <ForecastStack.Navigator>
    <ForecastStack.Screen name="Forecast" component={Forecast} />
  </ForecastStack.Navigator>
);

export default ForecastScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
    marginBottom: 0,
  },
  loadingContainer: {
    padding: 10,
  },
  loadingWrapper: {
    padding: 10,
    backgroundColor: 'white',
    flexGrow: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 3,
  },
  loaderBlockHeader: {
    width: '55%',
    height: 23,
    backgroundColor: '#cbd5e0',
  },
  loaderBlockBody: {
    width: '100%',
    height: 600,
  },
});

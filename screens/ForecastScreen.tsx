import { createStackNavigator } from '@react-navigation/stack';
import {
  useCombinedForecastV2Query,
  CombinedForecastV2DetailFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { addDays, endOfDay, format, startOfDay } from 'date-fns';
import React, { useCallback, useContext, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  useWindowDimensions,
  Text,
} from 'react-native';
import ForecastCard, {
  EmptyForecastCard,
  styles as cardStyles,
} from '../components/ForecastCard';
import FullScreenError from '../components/FullScreenError';
import LoaderBlock from '../components/LoaderBlock';
import { AppContext, trackEvent } from '../context/AppContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';
import { ISO_FORMAT } from './TideScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { gray, black, white } from '../colors';
import UpgradeNotice from '../components/UpgradeNotice';
import { useAppVersionContext } from '../context/AppVersionContext';
import { User, useUserContext } from '../context/UserContext';

const NUM_DAYS_LOGGED_IN = 9;
const NUM_DAYS_LOGGED_OUT = 2;

const ForecastStack = createStackNavigator();

const Forecast: React.FC = () => {
  useLocationSwitcher();
  useHeaderTitle('Forecast');
  const { user } = useUserContext();

  const { width } = useWindowDimensions();

  const [refreshing, setRefreshing] = React.useState(false);
  const [curIndex, setCurIndex] = React.useState(0);
  const { activeLocation } = useContext(AppContext);

  useEffect(() => {
    setCurIndex(0);
  }, [activeLocation.id, refreshing, user]);

  const [forecast, refresh] = useCombinedForecastV2Query({
    variables: {
      locationId: activeLocation.id,
      startDate: format(startOfDay(new Date()), ISO_FORMAT),
      endDate: format(
        addDays(
          endOfDay(new Date()),
          user.isLoggedIn ? NUM_DAYS_LOGGED_IN : NUM_DAYS_LOGGED_OUT,
        ),
        ISO_FORMAT,
      ),
    },
  });
  let data =
    forecast.data?.location?.combinedForecastV2?.slice(0, NUM_DAYS_LOGGED_IN) ||
    [];

  let sunData = forecast.data?.location?.sun || [];
  let tideData = forecast.data?.location?.tidePreditionStations[0]?.tides || [];
  let solunarData = forecast.data?.location?.solunar || [];
  let tideStationName =
    forecast.data?.location?.tidePreditionStations[0].name || '';

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh({ requestPolicy: 'network-only' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (refreshing && !forecast.fetching) {
      setRefreshing(false);
    }
  }, [refreshing, forecast.fetching]);

  let stuffToRender;
  if (forecast.fetching) {
    stuffToRender = <ForecastLoaderCard />;
  } else if (forecast.error && !data) {
    stuffToRender = <FullScreenError />;
  } else {
    stuffToRender = (
      <>
        <Header curIndex={curIndex} data={data} user={user} />
        <FlatList
          data={data}
          keyExtractor={(item) => item.name}
          horizontal={true}
          pagingEnabled={true}
          maxToRenderPerBatch={1}
          initialNumToRender={1}
          updateCellsBatchingPeriod={300}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          getItemLayout={(data, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            trackEvent('Forecast Swipe');
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurIndex(index);
          }}
          renderItem={({ item }) => {
            return (
              <ForecastCard
                key={item.name}
                datum={item}
                sunData={sunData}
                tideData={tideData}
                tideStationName={tideStationName}
                dateString={item.date}
                refreshing={refreshing}
                onRefresh={onRefresh}
                solunarData={solunarData}
              />
            );
          }}
          ListFooterComponent={() =>
            user.isLoggedIn ? null : <EmptyForecastCard />
          }
        />
      </>
    );
  }

  return stuffToRender;
};

const ForecastLoaderCard = () => (
  <View style={cardStyles.cardWrapper}>
    <View style={[styles.header, { alignItems: 'center' }]}>
      <LoaderBlock styles={styles.loaderBlockHeader} />
    </View>
    <View style={[cardStyles.children, { padding: 15 }]}>
      <LoaderBlock styles={styles.loaderBlockBody} />
    </View>
  </View>
);

const Header: React.FC<{
  curIndex: number;
  data: CombinedForecastV2DetailFragment[];
  user: User;
}> = ({ curIndex, data, user }) => {
  const { newVersionAvailable } = useAppVersionContext();
  const curData = data[curIndex];

  let showSwipeLeft;
  const title = curData
    ? `${curData.name} ${format(new Date(curData.date), 'M/d')}`
    : '';
  if (user.isLoggedIn) {
    showSwipeLeft = curIndex < data.length - 1;
  } else {
    showSwipeLeft = curIndex < data.length;
  }

  return (
    <>
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <View>
            <MaterialCommunityIcons
              name="gesture-swipe-right"
              size={20}
              color={curIndex > 0 ? 'rgba(255,255,255,.6)' : 'transparent'}
            />
          </View>
          <View>
            <Text style={styles.headerText}>{title}</Text>
          </View>
          <View>
            <MaterialCommunityIcons
              name="gesture-swipe-left"
              size={20}
              color={showSwipeLeft ? 'rgba(255,255,255,.6))' : 'transparent'}
            />
          </View>
        </View>
      </View>
      {newVersionAvailable && <UpgradeNotice />}
    </>
  );
};

const ForecastScreen = () => (
  <ForecastStack.Navigator>
    <ForecastStack.Screen name="ForecatStack" component={Forecast} />
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
    backgroundColor: white,
    flexGrow: 1,
    borderRadius: 8,
    shadowColor: black,
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
    backgroundColor: gray[600],
  },
  loaderBlockBody: {
    width: '100%',
    height: '100%',
  },
  header: {
    backgroundColor: gray[700],
    paddingVertical: 10,
    width: '100%',
  },
  headerInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerText: {
    color: white,
    fontSize: 17,
    fontWeight: '600',
  },
});

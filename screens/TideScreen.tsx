import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import { useTideQuery } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { buildDatasets } from '@stevenmusumeche/salty-solutions-shared/dist/tide-helpers';
import {
  addDays,
  addHours,
  format,
  isWithinInterval,
  startOfDay,
  subDays,
} from 'date-fns';
import React, { useCallback, useContext, useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { blue, gray, black, white } from '../colors';
import { ErrorIcon } from '../components/FullScreenError';
import HighLowTable from '../components/HighLowTable';
import LoaderBlock from '../components/LoaderBlock';
import MainTideChart from '../components/MainTideChart';
import MultiDayTideCharts from '../components/MultiDayTideCharts';
import { AppContext } from '../context/AppContext';
import { TideContext, TideContextProvider } from '../context/TideContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';
import TideOptionsScreen from './TideOptionsScreen';
import UpgradeNotice from '../components/UpgradeNotice';
import { useAppVersionContext } from '../context/AppVersionContext';
import { useUserContext } from '../context/UserContext';

const TideStack = createStackNavigator();

export const ISO_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";

const Tide: React.FC = () => {
  const { user } = useUserContext();
  const { date, selectedTideStation, selectedSite } = useContext(TideContext);
  const { activeLocation } = useContext(AppContext);
  const [refreshing, setRefreshing] = React.useState(false);

  useLocationSwitcher();
  useHeaderTitle(
    `${activeLocation.name} Tides (${format(new Date(date), 'EEEE M/d')})`,
    false,
    14,
  );

  const usgsSiteId =
    selectedSite && selectedSite.__typename === 'UsgsSite'
      ? selectedSite.id
      : undefined;

  const noaaStationId =
    selectedSite && selectedSite.__typename === 'TidePreditionStation'
      ? selectedSite.id
      : undefined;

  const [tideResult, refresh] = useTideQuery({
    variables: {
      locationId: activeLocation.id,
      tideStationId: selectedTideStation?.id!,
      usgsSiteId,
      includeUsgs: !!usgsSiteId,
      noaaStationId,
      includeNoaa: !!noaaStationId,
      startDate: format(subDays(startOfDay(date), 1), ISO_FORMAT),
      endDate: format(addDays(startOfDay(date), 2), ISO_FORMAT),
    },
    pause: !selectedTideStation || !selectedSite,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh({ requestPolicy: 'network-only' });
  }, [refresh]);

  useEffect(() => {
    if (refreshing && !tideResult.fetching) {
      setRefreshing(false);
    }
  }, [refreshing, tideResult.fetching]);

  const waterHeightBase =
    tideResult.data?.usgsSite?.waterHeight ||
    tideResult.data?.noaaWaterHeight?.waterHeight;

  let stuffToRender;
  if (tideResult.fetching) {
    stuffToRender = <Loading />;
  } else if (
    !tideResult?.data?.tidePreditionStation?.tides ||
    !tideResult.data.location?.sun ||
    !tideResult.data.location.moon ||
    !tideResult.data.location.solunar ||
    !waterHeightBase
  ) {
    stuffToRender = (
      <View style={styles.errorContainer}>
        <ErrorIcon />
      </View>
    );
  } else {
    // filter data for current date
    const sunData = tideResult.data.location.sun.filter(
      (x) =>
        startOfDay(new Date(x.sunrise)).toISOString() ===
        startOfDay(date).toISOString(),
    )[0];

    if (!sunData) {
      stuffToRender = <Loading />;
    } else {
      const moonData = tideResult.data.location.moon.filter(
        (x) =>
          startOfDay(new Date(x.date)).toISOString() ===
          startOfDay(date).toISOString(),
      )[0];

      const solunarData = tideResult.data.location.solunar.filter(
        (x) =>
          startOfDay(new Date(x.date)).toISOString() ===
          startOfDay(date).toISOString(),
      )[0];

      const curDayWaterHeight = waterHeightBase.filter((x) =>
        isWithinInterval(new Date(x.timestamp), {
          start: startOfDay(date),
          end: startOfDay(addDays(date, 1)),
        }),
      );

      const curDayTides = tideResult.data.tidePreditionStation.tides.filter(
        (x) =>
          isWithinInterval(new Date(x.time), {
            start: startOfDay(date),
            end: startOfDay(addDays(date, 1)),
          }),
      );

      const { hiLowData } = buildDatasets(
        sunData,
        curDayTides,
        curDayWaterHeight,
      );

      let tickValues = [];
      for (let i = 0; i <= 24; i += 4) {
        tickValues.push(addHours(startOfDay(date), i));
      }

      if (!solunarData || !moonData) {
        stuffToRender = <Loading />;
      } else {
        stuffToRender = (
          <>
            <View style={styles.chartWrapper}>
              <MainTideChart
                sunData={sunData}
                tideData={curDayTides}
                waterHeightData={curDayWaterHeight}
                solunarData={user.entitledToPremium ? solunarData : undefined}
              />
              <MultiDayTideCharts
                sunData={tideResult.data.location.sun}
                tideData={tideResult.data.tidePreditionStation.tides}
                waterHeightData={waterHeightBase}
                numDays={3}
                solunarData={tideResult.data.location.solunar}
              />
              <ChartLabel />
            </View>
            <View style={styles.hiLowWrapper}>
              <HighLowTable
                hiLowData={hiLowData}
                sunData={sunData}
                moonData={moonData}
                solunarData={solunarData}
              />
            </View>
          </>
        );
      }
    }
  }

  const wrapperProps = {
    onRefresh,
    refreshing,
  };

  return <Wrapper {...wrapperProps}>{stuffToRender}</Wrapper>;
};

const ChartLabel = () => {
  const { user } = useUserContext();

  return (
    <View style={styles.chartLabelWrapper}>
      <View style={styles.chartLabelInnerWrapper}>
        <ChartLabelSwatch color={blue[600]} />
        <Text style={styles.chartLabel}>PREDICTED</Text>
      </View>
      <View style={styles.chartLabelInnerWrapper}>
        <ChartLabelSwatch color={black} />
        <Text style={styles.chartLabel}>OBSERVED</Text>
      </View>
      {user.entitledToPremium && (
        <View style={[styles.chartLabelInnerWrapper, { marginRight: 0 }]}>
          <ChartLabelSwatch color={blue.solunar} />
          <Text style={styles.chartLabel}>FEEDING PERIOD</Text>
        </View>
      )}
    </View>
  );
};

const ChartLabelSwatch: React.FC<{ color: string }> = ({ color }) => (
  <View
    style={[
      styles.chartLabelSwatch,
      {
        backgroundColor: color,
      },
    ]}
  />
);

const Header = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { selectedTideStation, selectedSite: selectedUsgsSite } = useContext(
    TideContext,
  );

  return (
    <TouchableOpacity onPress={() => navigation.push('TideOptionsScreen')}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Text numberOfLines={1}>
            <Text style={styles.headerLabel}>Station: </Text>
            <Text>{selectedTideStation?.name}</Text>
          </Text>
          <Text numberOfLines={1}>
            <Text style={styles.headerLabel}>Observed: </Text>
            <Text>{selectedUsgsSite?.name} and some more text</Text>
          </Text>
        </View>
        <View>
          <Feather name="edit" size={24} color={gray[700]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface WrapperProps {
  refreshing: boolean;
  onRefresh: () => void;
}

const Wrapper: React.FC<WrapperProps> = ({
  children,
  refreshing,
  onRefresh,
}) => {
  const { newVersionAvailable } = useAppVersionContext();
  return (
    <>
      {newVersionAvailable && <UpgradeNotice />}
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          <Header />
          {children}
        </ScrollView>
      </View>
    </>
  );
};

const Loading: React.FC = () => {
  const { height } = useWindowDimensions();
  return (
    <View style={styles.loaderWrapper}>
      <LoaderBlock
        styles={{
          ...styles.loaderBlock,
          height: height - 255,
        }}
      />
    </View>
  );
};

const RootStack = createStackNavigator();

const TideStackScreen = () => (
  <TideContextProvider>
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'transparentModal',
        cardOverlayEnabled: true,
      }}
    >
      <RootStack.Screen name="TideScreen" component={TideScreen} />
      <RootStack.Screen
        name="TideOptionsScreen"
        component={TideOptionsScreen}
      />
    </RootStack.Navigator>
  </TideContextProvider>
);

const TideScreen = () => (
  <TideStack.Navigator>
    <TideStack.Screen name="Tide" component={Tide} />
  </TideStack.Navigator>
);

export default TideStackScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderWrapper: { backgroundColor: white, flex: 1 },
  loaderBlock: {
    width: 'auto',
    margin: 15,
  },
  loaderPillWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  loaderPill: {
    backgroundColor: gray[400],
    width: '49%',
    height: 30,
    marginBottom: 5,
  },
  errorContainer: {
    flexGrow: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  chartWrapper: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  hiLowWrapper: {
    paddingHorizontal: 10,
    paddingVertical: 15,
    paddingBottom: 0,
    borderTopColor: gray[400],
    borderTopWidth: 1,
  },
  chartLabelWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  chartLabelInnerWrapper: {
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartLabelSwatch: {
    height: 12,
    width: 12,
    borderRadius: 3,
    marginRight: 5,
  },
  chartLabel: {
    fontSize: 12,
    letterSpacing: 0.2,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginBottom: 15,
    padding: 10,
    borderBottomColor: gray[400],
    borderBottomWidth: 1,
  },
  headerLeft: {
    marginRight: 10,
    flexBasis: 0,
    flexGrow: 1,
  },
  headerLabel: {
    textTransform: 'uppercase',
    color: gray[700],
    width: 80,
  },
});

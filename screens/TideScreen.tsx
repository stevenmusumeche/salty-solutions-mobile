import { Octicons } from '@expo/vector-icons';
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
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { blue, gray } from '../colors';
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

const TideStack = createStackNavigator();

export const ISO_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";

const Tide: React.FC = () => {
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

      stuffToRender = (
        <>
          <MainTideChart
            sunData={sunData}
            tideData={curDayTides}
            waterHeightData={curDayWaterHeight}
          />
          <MultiDayTideCharts
            sunData={tideResult.data.location.sun}
            tideData={tideResult.data.tidePreditionStation.tides}
            waterHeightData={waterHeightBase}
            numDays={3}
          />
          <ChartLabel />
          <HighLowTable
            hiLowData={hiLowData}
            sunData={sunData}
            moonData={moonData}
          />
        </>
      );
    }
  }

  const wrapperProps = {
    onRefresh,
    refreshing,
  };

  return <Wrapper {...wrapperProps}>{stuffToRender}</Wrapper>;
};

const ChartLabel = () => (
  <View style={styles.chartLabelWrapper}>
    <View style={styles.chartLabelInnerWrapper}>
      <ChartLabelSwatch color="black" />
      <Text>PREDICTED</Text>
    </View>
    <View style={styles.chartLabelInnerWrapper}>
      <ChartLabelSwatch color={blue[600]} />
      <Text>OBSERVED</Text>
    </View>
  </View>
);

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
          <Octicons name="settings" size={32} color={gray[700]} />
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
  return (
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
  );
};

const Loading: React.FC = () => (
  <>
    {/* eslint-disable react-native/no-inline-styles */}
    <LoaderBlock styles={{ ...styles.loaderBlock, height: 250 }} />
    <LoaderBlock styles={{ ...styles.loaderBlock, height: 110 }} />
    <LoaderBlock
      styles={{
        ...styles.loaderBlock,
        height: 30,
        width: '60%',
        alignSelf: 'center',
      }}
    />
    {/* eslint-enable react-native/no-inline-styles */}
    <View style={styles.loaderPillWrapper}>
      <LoaderBlock styles={styles.loaderPill} />
      <LoaderBlock styles={styles.loaderPill} />
      <LoaderBlock styles={styles.loaderPill} />
      <LoaderBlock styles={styles.loaderPill} />
      <LoaderBlock styles={styles.loaderPill} />
      <LoaderBlock styles={styles.loaderPill} />
      <LoaderBlock styles={styles.loaderPill} />
    </View>
  </>
);

const RootStack = createStackNavigator();

const TideStackScreen = () => (
  <TideContextProvider>
    <RootStack.Navigator
      mode="modal"
      screenOptions={{
        headerShown: false,
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
    margin: 20,
    marginBottom: 0,
  },
  loaderBlock: {
    backgroundColor: gray[400],
    width: '100%',
    marginBottom: 20,
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
  chartLabelWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  chartLabelInnerWrapper: {
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartLabelSwatch: {
    height: 18,
    width: 18,
    borderRadius: 3,
    marginRight: 5,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
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

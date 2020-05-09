import { createStackNavigator } from '@react-navigation/stack';
import {
  useTideQuery,
  UsgsParam,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { buildDatasets } from '@stevenmusumeche/salty-solutions-shared/dist/tide-helpers';
import {
  addDays,
  addHours,
  format,
  isSameDay,
  startOfDay,
  subDays,
} from 'date-fns';
import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
} from 'react';
import {
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { useScrollToTop } from '@react-navigation/native';
import HighLowTable from '../components/HighLowTable';
import MainTideChart from '../components/MainTideChart';
import MultiDayTideCharts from '../components/MultiDayTideCharts';
import { AppContext } from '../context/AppContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';
import UsgsSiteSelect from '../components/UsgsSiteSelect';
import TideStationSelect from '../components/TideStationSelect';
import LoaderBlock from '../components/LoaderBlock';
import { ErrorIcon } from '../components/FullScreenError';

const ForecastStack = createStackNavigator();

const ISO_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";

const Tide: React.FC = () => {
  const scrollRef = React.useRef(null);
  useScrollToTop(scrollRef);
  const [refreshing, setRefreshing] = React.useState(false);

  const [date, setDate] = useState(() => startOfDay(new Date()));
  useLocationSwitcher();
  useHeaderTitle('Tides');

  const { activeLocation } = useContext(AppContext);

  const tideStations = activeLocation.tidePreditionStations;
  const usgsSites = useMemo(
    () =>
      activeLocation.usgsSites.filter((site) =>
        site.availableParams.includes(UsgsParam.GuageHeight),
      ),
    [activeLocation.usgsSites],
  );

  const [selectedTideStationId, setSelectedTideStationId] = useState(
    tideStations[0].id,
  );
  const [selectedUsgsSiteId, setSelectedUsgsSiteId] = useState(usgsSites[0].id);

  useEffect(() => {
    // if locationId changes, set tide station back to the default
    setSelectedTideStationId(tideStations[0].id);
    setSelectedUsgsSiteId(usgsSites[0].id);
  }, [activeLocation, tideStations, usgsSites]);

  const [tideResult, refresh] = useTideQuery({
    variables: {
      locationId: activeLocation.id,
      tideStationId: selectedTideStationId!,
      usgsSiteId: selectedUsgsSiteId!,
      startDate: format(subDays(startOfDay(date), 3), ISO_FORMAT),
      endDate: format(addDays(startOfDay(date), 4), ISO_FORMAT),
    },
    pause: selectedTideStationId === undefined,
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

  let stuffToRender;
  if (tideResult.fetching) {
    stuffToRender = <Loading />;
  } else if (
    !tideResult.data ||
    !tideResult.data.tidePreditionStation ||
    !tideResult.data.tidePreditionStation.tides ||
    !tideResult.data.location ||
    !tideResult.data.location.sun ||
    !tideResult.data.location.moon ||
    !tideResult.data.usgsSite ||
    !tideResult.data.usgsSite.waterHeight
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
    }

    const moonData = tideResult.data.location.moon.filter(
      (x) =>
        startOfDay(new Date(x.date)).toISOString() ===
        startOfDay(date).toISOString(),
    )[0];

    const curDayWaterHeight = tideResult.data.usgsSite.waterHeight.filter(
      (x) => {
        return isSameDay(new Date(x.timestamp), date);
      },
    );

    const curDayTides = tideResult.data.tidePreditionStation.tides.filter((x) =>
      isSameDay(new Date(x.time), date),
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
          date={date}
        />
        <MultiDayTideCharts
          sunData={tideResult.data.location.sun}
          tideData={tideResult.data.tidePreditionStation.tides}
          waterHeightData={tideResult.data.usgsSite.waterHeight}
          activeDate={date}
          setActiveDate={setDate}
          numDays={3}
        />
        <HighLowTable
          hiLowData={hiLowData}
          sunData={sunData}
          moonData={moonData}
        />
      </>
    );
  }

  const wrapperProps = {
    onRefresh,
    refreshing,
    date,
    tideStations,
    selectedTideStationId,
    setSelectedTideStationId,
    usgsSites,
    selectedUsgsSiteId,
    setSelectedUsgsSiteId,
    scrollRef,
  };

  return <Wrapper {...wrapperProps}>{stuffToRender}</Wrapper>;
};

const TideScreen = () => (
  <ForecastStack.Navigator>
    <ForecastStack.Screen name="Forecast" component={Tide} />
  </ForecastStack.Navigator>
);

export default TideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    marginBottom: 0,
  },
  selectLabel: {
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  usgsSelectWrapper: {
    marginTop: 10,
    marginBottom: 20,
  },
  loaderBlock: {
    backgroundColor: '#cbd5e0',
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
    backgroundColor: '#cbd5e0',
    width: '49%',
    height: 30,
    marginBottom: 5,
  },
  errorContainer: {
    flexGrow: 1,
    alignItems: 'center',
    marginTop: 20,
  },
});

interface WrapperProps {
  refreshing: any;
  onRefresh: any;
  date: any;
  tideStations: any;
  selectedTideStationId: any;
  setSelectedTideStationId: any;
  usgsSites: any;
  selectedUsgsSiteId: any;
  setSelectedUsgsSiteId: any;
  scrollRef: any;
}

const Wrapper: React.FC<WrapperProps> = ({
  children,
  refreshing,
  onRefresh,
  date,
  tideStations,
  selectedTideStationId,
  setSelectedTideStationId,
  usgsSites,
  selectedUsgsSiteId,
  setSelectedUsgsSiteId,
  scrollRef,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ marginBottom: 20 }}>Date: {date.toISOString()}</Text>
        <View>
          <Text style={styles.selectLabel}>Tide Station:</Text>
          <TideStationSelect
            tideStations={tideStations}
            selectedId={selectedTideStationId}
            handleChange={(stationId) => setSelectedTideStationId(stationId)}
          />
        </View>
        <View style={styles.usgsSelectWrapper}>
          <Text style={styles.selectLabel}>Observation Site:</Text>
          <UsgsSiteSelect
            sites={usgsSites}
            selectedId={selectedUsgsSiteId}
            handleChange={(siteId) => setSelectedUsgsSiteId(siteId)}
            style={{
              inputIOS: {
                fontSize: undefined,
                backgroundColor: 'white',
                paddingVertical: 6,
                paddingHorizontal: 10,
              },
              inputAndroid: {
                height: 30,
                fontSize: undefined,
                backgroundColor: 'white',
                paddingVertical: 6,
                paddingHorizontal: 10,
              },
              iconContainer: {
                top: 5,
                right: 5,
              },
            }}
          />
        </View>
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

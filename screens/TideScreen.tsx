import { MaterialIcons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import {
  TideStationDetailFragment,
  useTideQuery,
  UsgsParam,
  UsgsSiteDetailFragment,
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
  useMemo,
  useState,
} from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ErrorIcon } from '../components/FullScreenError';
import HighLowTable from '../components/HighLowTable';
import LoaderBlock from '../components/LoaderBlock';
import MainTideChart from '../components/MainTideChart';
import MultiDayTideCharts from '../components/MultiDayTideCharts';
import TideStationSelect from '../components/TideStationSelect';
import UsgsSiteSelect from '../components/UsgsSiteSelect';
import { AppContext } from '../context/AppContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';

const ForecastStack = createStackNavigator();

const ISO_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSxxx";

const Tide: React.FC = () => {
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
    } else {
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

      const curDayTides = tideResult.data.tidePreditionStation.tides.filter(
        (x) => isSameDay(new Date(x.time), date),
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
    date,
    setDate,
    tideStations,
    selectedTideStationId,
    setSelectedTideStationId,
    usgsSites,
    selectedUsgsSiteId,
    setSelectedUsgsSiteId,
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
      <ChartLabelSwatch color="#3182ce" />
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
  dateWrapper: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    color: 'black',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateCaret: {
    position: 'absolute',
    right: 5,
    top: 5,
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
});

interface WrapperProps {
  refreshing: boolean;
  onRefresh: () => void;
  date: Date;
  setDate: (date: Date) => void;
  tideStations: TideStationDetailFragment[];
  selectedTideStationId: string;
  setSelectedTideStationId: (id: string) => void;
  usgsSites: UsgsSiteDetailFragment[];
  selectedUsgsSiteId: string;
  setSelectedUsgsSiteId: (id: string) => void;
}

const Wrapper: React.FC<WrapperProps> = ({
  children,
  refreshing,
  onRefresh,
  date,
  setDate,
  tideStations,
  selectedTideStationId,
  setSelectedTideStationId,
  usgsSites,
  selectedUsgsSiteId,
  setSelectedUsgsSiteId,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <DateSelect date={date} setDate={setDate} />
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

const DateSelect: React.FC<{ date: Date; setDate: (date: Date) => void }> = ({
  setDate,
  date,
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    hideDatePicker();
    setDate(date);
  };

  return (
    <View>
      <Text style={styles.selectLabel}>Date:</Text>
      <TouchableOpacity onPress={showDatePicker}>
        <View style={styles.dateWrapper}>
          <Text>{format(date, 'EEEE, MMMM d, yyyy')}</Text>
          <View style={styles.dateCaret}>
            <MaterialIcons name="arrow-drop-down" size={20} color="#2c5282" />
          </View>
        </View>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        date={date}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

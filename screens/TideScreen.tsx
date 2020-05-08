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
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import HighLowTable from '../components/HighLowTable';
import MainTideChart from '../components/MainTideChart';
import MultiDayTideCharts from '../components/MultiDayTideCharts';
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
  const usgsSites = activeLocation.usgsSites.filter((site) =>
    site.availableParams.includes(UsgsParam.GuageHeight),
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
    if (refreshing === true) {
      setRefreshing(false);
    }
  }, [refreshing, tideResult.fetching]);

  if (tideResult.fetching && !refreshing) {
    // todo:
    return (
      <Wrapper refreshing={refreshing} onRefresh={onRefresh}>
        <Text>Fetching</Text>
      </Wrapper>
    );
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
    // todo
    return <Text>error</Text>;
  }

  // filter data for current date
  const sunData = tideResult.data.location.sun.filter(
    (x) =>
      startOfDay(new Date(x.sunrise)).toISOString() ===
      startOfDay(date).toISOString(),
  )[0];

  if (!sunData) {
    // todo:
    return <Text>Fetching</Text>;
  }

  const moonData = tideResult.data.location.moon.filter(
    (x) =>
      startOfDay(new Date(x.date)).toISOString() ===
      startOfDay(date).toISOString(),
  )[0];

  const curDayWaterHeight = tideResult.data.usgsSite.waterHeight.filter((x) => {
    return isSameDay(new Date(x.timestamp), date);
  });

  const curDayTides = tideResult.data.tidePreditionStation.tides.filter((x) =>
    isSameDay(new Date(x.time), date),
  );

  const { hiLowData } = buildDatasets(sunData, curDayTides, curDayWaterHeight);

  let tickValues = [];
  for (let i = 0; i <= 24; i += 4) {
    tickValues.push(addHours(startOfDay(date), i));
  }

  return (
    <Wrapper refreshing={refreshing} onRefresh={onRefresh}>
      <Text>Date: {date.toISOString()}</Text>
      <Text>Tide station: {selectedTideStationId}</Text>
      <Text>Observation site: {selectedUsgsSiteId}</Text>
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
    </Wrapper>
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
      >
        {children}
      </ScrollView>
    </View>
  );
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
    padding: 10,
  },
});

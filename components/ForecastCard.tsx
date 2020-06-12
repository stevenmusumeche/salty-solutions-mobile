import {
  CombinedForecastV2DetailFragment,
  SunDetailFieldsFragment,
  TideDetailFieldsFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import ForecastChart from './ForecastChart';
import ForecastSun from './ForecastSun';
import ForecastText from './ForecastText';
import ForecastTide from './ForecastTide';
import ForecastTimeBuckets from './ForecastTimeBuckets';

interface Props {
  datum: CombinedForecastV2DetailFragment;
  tideStationName: string;
  tideData: TideDetailFieldsFragment[];
  sunData: SunDetailFieldsFragment[];
  dateString: string;
  refreshing: boolean;
  onRefresh: () => void;
}

const ForecastCard: React.FC<Props> = (props) => {
  const {
    datum,
    dateString,
    tideData,
    sunData,
    tideStationName,
    refreshing,
    onRefresh,
  } = props;
  const date = new Date(dateString);

  const { width } = useWindowDimensions();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ width }}>
        <View style={styles.cardWrapper}>
          <View style={styles.children}>
            <ForecastChart data={datum} date={date} />
            <ForecastTimeBuckets data={datum} date={date} />
            <ForecastTide
              tideData={tideData}
              stationName={tideStationName}
              date={date}
              sunData={sunData}
            />
            <ForecastSun sunData={sunData} date={date} />
            <ForecastText day={datum.day} night={datum.night} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default React.memo(ForecastCard);

export const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: 'white',
    flexGrow: 1,
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
  },
  children: {
    flex: 1,
    width: '100%',
    flexGrow: 1,
    paddingVertical: 15,
  },
});

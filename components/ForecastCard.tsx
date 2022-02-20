import {
  CombinedForecastV2DetailFragment,
  SunDetailFieldsFragment,
  TideDetailFieldsFragment,
  SolunarDetailFieldsFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { white } from '../colors';
import ForecastChart from './ForecastChart';
import ForecastSun from './ForecastSun';
import ForecastText from './ForecastText';
import ForecastTide from './ForecastTide';
import ForecastTimeBuckets from './ForecastTimeBuckets';
import Teaser from './Teaser';

interface Props {
  datum: CombinedForecastV2DetailFragment;
  tideStationName: string;
  tideData: TideDetailFieldsFragment[];
  sunData: SunDetailFieldsFragment[];
  dateString: string;
  refreshing: boolean;
  onRefresh: () => void;
  solunarData: SolunarDetailFieldsFragment[];
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
    solunarData,
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
              solunarData={solunarData}
            />
            <ForecastSun
              sunData={sunData}
              date={date}
              solunarData={solunarData}
            />
            <ForecastText day={datum.day} night={datum.night} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default React.memo(ForecastCard);

export const EmptyForecastCard = () => {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.container}>
      <View style={{ width, flex: 1 }}>
        <Teaser
          title="Want our extended forecast?"
          description={
            'When should you go fishing? Access our extended 9-day forecast to make the most of your upcoming day on the water.'
          }
          buttonSubtitle="Join now to access the full 9-day forecast."
        />
      </View>
    </View>
  );
};

export const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: white,
    flexGrow: 1,
    alignItems: 'center',
  },
  container: {
    backgroundColor: white,
    flex: 1,
  },
  children: {
    flex: 1,
    width: '100%',
    flexGrow: 1,
    paddingVertical: 15,
  },
});

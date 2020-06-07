import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import {
  CombinedForecastV2DetailFragment,
  TideDetailFieldsFragment,
  SunDetailFieldsFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import WaterConditionIcon from './WaterConditionIcon';
import Compass from './svg/Compass';
import ForecastChart from './ForecastChart';
import ForecastTimeBuckets from './ForecastTimeBuckets';
import ForecastTide from './ForecastTide';
import ForecastSun from './ForecastSun';
import ForecastText from './ForecastText';

interface Props {
  datum: CombinedForecastV2DetailFragment;
  tideStationName: string;
  tideData: TideDetailFieldsFragment[];
  sunData: SunDetailFieldsFragment[];
  date: Date;
}

const ForecastCard: React.FC<Props> = ({
  datum,
  date,
  tideData,
  sunData,
  tideStationName,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.cardWrapper}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{datum.name}</Text>
        </View>
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
  );
};

export default ForecastCard;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  cardWrapper: {
    backgroundColor: 'white',
    flexGrow: 1,
    alignItems: 'center',
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
  header: {
    backgroundColor: '#edf2f7',
    width: '100%',
    alignItems: 'center',
    padding: 8,
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    fontSize: 18,
  },
  children: {
    flex: 1,
    width: '100%',
    flexGrow: 1,
    paddingVertical: 15,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CombinedForecastV2DetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { prepareForecastData } from '@stevenmusumeche/salty-solutions-shared/dist/forecast-helpers';
import WaterConditionIcon from './WaterConditionIcon';

interface Props {
  data: CombinedForecastV2DetailFragment;
  date: Date;
}

const ForecastTimeBuckets: React.FC<Props> = ({ data, date }) => {
  const { timeChunks } = prepareForecastData(data, date);

  return (
    <View style={styles.container}>
      {timeChunks.map((timeChunk, i) => (
        <View style={styles.bucketContainer} key={i}>
          <Text style={styles.label}>{timeChunk.label}</Text>
          <WaterConditionIcon min={timeChunk.min} max={timeChunk.max} />
        </View>
      ))}
    </View>
  );
};

export default ForecastTimeBuckets;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    marginTop: 15,
    backgroundColor: '#f7fafc',
    borderColor: '#edf2f7',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bucketContainer: {
    width: '25%',
  },
  label: {
    textAlign: 'center',
    textTransform: 'uppercase',
    color: '#718096',
    fontSize: 12,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CombinedForecastV2DetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import {
  prepareForecastData,
  degreesToCompass,
} from '@stevenmusumeche/salty-solutions-shared/dist/forecast-helpers';
import WaterConditionIcon from './WaterConditionIcon';
import { gray } from '../colors';

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
          {timeChunk.min === Infinity ? (
            <Text style={styles.wind}>unknown</Text>
          ) : (
            <Text style={styles.wind}>
              <WindRange min={timeChunk.min} max={timeChunk.max} />{' '}
              {degreesToCompass(timeChunk.averageDirection)}
            </Text>
          )}
          {timeChunk.averageTemperature && (
            <Text style={styles.temperature}>
              {timeChunk.averageTemperature.toFixed(0)}°
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};

const WindRange: React.FC<{ min: number; max: number }> = ({ min, max }) => {
  const roundedMin = Math.ceil(min);
  const roundedMax = Math.ceil(max);
  const isSame = roundedMin === roundedMax;
  return <>{isSame ? roundedMin : `${roundedMin}-${roundedMax}`}</>;
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    marginTop: 15,
    backgroundColor: gray[100],
    borderColor: gray[200],
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
    color: gray[600],
    fontSize: 12,
  },
  wind: {
    textAlign: 'center',
    textTransform: 'uppercase',
    fontSize: 12,
    marginTop: 8,
  },
  temperature: {
    textAlign: 'center',
    fontSize: 20,
    marginTop: 4,
  },
});

export default ForecastTimeBuckets;

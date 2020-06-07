import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CombinedForecastV2DetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';

interface Props {
  data: CombinedForecastV2DetailFragment;
  date: Date;
}

const ForecastTimeBuckets: React.FC<Props> = (props) => {
  return (
    <View style={styles.container}>
      <Text>time buckets</Text>
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
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CombinedForecastV2DetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';

const WIND_WARNING_MIN = 20;

interface Props {
  data: CombinedForecastV2DetailFragment;
  date: Date;
}

const ForecastChart: React.FC<Props> = (props) => {
  return (
    <View style={styles.container}>
      <Text>chart</Text>
    </View>
  );
};

export default ForecastChart;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  TideDetailFieldsFragment,
  SunDetailFieldsFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';

interface Props {
  stationName: string;
  tideData: TideDetailFieldsFragment[];
  sunData: SunDetailFieldsFragment[];
  date: Date;
}

const ForecastTide: React.FC<Props> = (props) => {
  return (
    <View style={styles.container}>
      <Text>tide</Text>
    </View>
  );
};

export default ForecastTide;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginTop: 4,
  },
});

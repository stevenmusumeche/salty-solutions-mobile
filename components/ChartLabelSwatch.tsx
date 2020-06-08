import React from 'react';
import { View, StyleSheet } from 'react-native';

const ChartLabelSwatch: React.FC<{ color: string; opacity?: number }> = ({
  color,
  opacity = 1,
}) => (
  <View
    style={[
      styles.chartLabelSwatch,
      {
        backgroundColor: color,
        opacity,
      },
    ]}
  />
);

const styles = StyleSheet.create({
  chartLabelSwatch: {
    height: 12,
    width: 12,
    borderRadius: 2,
    marginRight: 3,
  },
});

export default ChartLabelSwatch;

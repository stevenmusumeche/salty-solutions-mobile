import React from 'react';
import Calendar from './svg/Calendar';
import { View, Text, StyleSheet } from 'react-native';
import { gray } from '../colors';

const NoData = () => (
  <View style={styles.container}>
    <View style={{}}>
      <Calendar style={styles.icon} />
    </View>
    <Text style={styles.text}>No Recent Data Available</Text>
  </View>
);

export default NoData;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  icon: {
    width: 100,
    height: 100,
  },
  text: {
    fontSize: 10,
    color: gray[700],
  },
});

import React, { useMemo, FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SunDetailFieldsFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { startOfDay, format } from 'date-fns';
import { gray } from '../colors';

interface Props {
  sunData: SunDetailFieldsFragment[];
  date: Date;
}

const ForecastSun: React.FC<Props> = ({ sunData, date }) => {
  const curDaySunData: SunDetailFieldsFragment = useMemo(
    () =>
      sunData.filter(
        (x) =>
          startOfDay(new Date(x.sunrise)).toISOString() ===
          startOfDay(date).toISOString(),
      )[0] || {},
    [sunData, date],
  );

  return (
    <View style={styles.container}>
      <SunDay
        name="nautical dawn"
        value={new Date(curDaySunData.nauticalDawn)}
      />
      <SunDay name="sunrise" value={new Date(curDaySunData.sunrise)} />
      <SunDay name="sunset" value={new Date(curDaySunData.sunset)} />
      <SunDay
        name="nautical dusk"
        value={new Date(curDaySunData.nauticalDusk)}
      />
    </View>
  );
};

export default ForecastSun;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    marginTop: 15,
    backgroundColor: gray[100],
    borderColor: gray[200],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
});

const SunDay: FC<{ name: string; value: Date }> = ({ name, value }) => (
  <View style={sunDayStyles.container}>
    <Text style={sunDayStyles.time}>{format(value, 'h:mm')}</Text>
    <Text style={sunDayStyles.label}>{name}</Text>
  </View>
);

const sunDayStyles = StyleSheet.create({
  container: {
    width: '25%',
  },
  time: {
    textAlign: 'center',
    fontSize: 22,
  },
  label: {
    textAlign: 'center',
    textTransform: 'uppercase',
    color: gray[600],
    fontSize: 10,
    letterSpacing: -0.3,
  },
});

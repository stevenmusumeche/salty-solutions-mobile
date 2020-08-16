import React, { useMemo, FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  SunDetailFieldsFragment,
  SolunarDetailFieldsFragment,
  SolunarPeriodFieldsFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { startOfDay, format } from 'date-fns';
import { gray } from '../colors';
import Stars from './Stars';

interface Props {
  sunData: SunDetailFieldsFragment[];
  date: Date;
  solunarData: SolunarDetailFieldsFragment[];
}

const ForecastSun: React.FC<Props> = ({ sunData, date, solunarData }) => {
  const curDaySunData: SunDetailFieldsFragment = useMemo(
    () =>
      sunData.filter(
        (x) =>
          startOfDay(new Date(x.sunrise)).toISOString() ===
          startOfDay(date).toISOString(),
      )[0] || {},
    [sunData, date],
  );

  const curDaySolunarData: SolunarDetailFieldsFragment = useMemo(
    () =>
      solunarData.filter(
        (x) =>
          startOfDay(new Date(x.date)).toISOString() ===
          startOfDay(date).toISOString(),
      )[0] || {},
    [solunarData, date],
  );

  return (
    <View style={styles.container}>
      <View style={styles.rowWrapper}>
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
      <View style={styles.rowWrapper}>
        <SolunarPeriod type="Major" periods={curDaySolunarData.majorPeriods} />
        <SolunarPeriod type="Minor" periods={curDaySolunarData.minorPeriods} />
      </View>
      <View style={styles.starsWrapper}>
        <Stars score={curDaySolunarData.score} />
        <Text style={[sunDayStyles.label, { fontSize: 12 }]}>
          Solunar Score
        </Text>
      </View>
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
  },
  rowWrapper: {
    flexDirection: 'row',
  },
  starsWrapper: {
    width: '40%',
    marginTop: 20,
    alignSelf: 'center',
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
  solunarContainer: {
    width: '50%',
    marginTop: 20,
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

const SolunarPeriod: FC<{
  type: 'Major' | 'Minor';
  periods: SolunarPeriodFieldsFragment[];
}> = ({ type, periods }) => (
  <View style={sunDayStyles.solunarContainer}>
    {periods.map((period) => (
      <View key={period.start}>
        <Text style={[sunDayStyles.time, { fontSize: 16 }]}>
          {format(new Date(period.start), 'h:mmaaaaa')} -{' '}
          {format(new Date(period.end), 'h:mmaaaaa')}
        </Text>
      </View>
    ))}

    <Text style={sunDayStyles.label}>{type} Feeding Periods</Text>
  </View>
);

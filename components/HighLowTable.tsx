import {
  SunDetailFieldsFragment,
  MoonDetailFieldsFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pill from './Pill';

interface Props {
  hiLowData: any[];
  sunData?: SunDetailFieldsFragment;
  moonData: MoonDetailFieldsFragment;
}

const HighLowTable: React.FC<Props> = ({ hiLowData, sunData, moonData }) => {
  const formatDate = (x: string) => (
    <Text style={styles.date}>{format(new Date(x), 'h:mma')}</Text>
  );

  return (
    <View style={styles.container}>
      {hiLowData.map(({ x, y, type }, i) => (
        <Pill key={i} label={`${type} Tide`}>
          {formatDate(x)}
        </Pill>
      ))}

      {sunData && sunData.dawn && (
        <Pill label="Dawn" color="#c05621">
          {formatDate(sunData.dawn)}
        </Pill>
      )}
      {sunData && sunData.sunrise && (
        <Pill label="Sunrise" color="#c05621">
          {formatDate(sunData.sunrise)}
        </Pill>
      )}
      {sunData && sunData.sunset && (
        <Pill label="Sunset" color="#c05621">
          {formatDate(sunData.sunset)}
        </Pill>
      )}
      {sunData && sunData.dusk && (
        <Pill label="Dusk" color="#c05621">
          {formatDate(sunData.dusk)}
        </Pill>
      )}

      {moonData && moonData.phase && (
        <Pill label="Moon Phase" color="#2c5282">
          {/* todo moon icon */}
          {moonData.phase}
        </Pill>
      )}
    </View>
  );
};

export default HighLowTable;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  date: {
    textTransform: 'lowercase',
  },
});

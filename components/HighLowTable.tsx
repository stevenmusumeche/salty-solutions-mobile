import {
  SunDetailFieldsFragment,
  MoonDetailFieldsFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pill from './Pill';
import { blue, orange } from '../colors';

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
      {hiLowData.map(({ x, type }, i) => (
        <Pill key={i} label={`${type} Tide`}>
          {formatDate(x)}
        </Pill>
      ))}

      {sunData?.nauticalDawn && (
        <Pill label="Naut Dawn" color={orange[700]}>
          {formatDate(sunData.nauticalDawn)}
        </Pill>
      )}
      {sunData?.dawn && (
        <Pill label="Dawn" color={orange[700]}>
          {formatDate(sunData.dawn)}
        </Pill>
      )}
      {sunData?.sunrise && (
        <Pill label="Sunrise" color={orange[700]}>
          {formatDate(sunData.sunrise)}
        </Pill>
      )}
      {sunData?.sunset && (
        <Pill label="Sunset" color={orange[700]}>
          {formatDate(sunData.sunset)}
        </Pill>
      )}
      {sunData?.dusk && (
        <Pill label="Dusk" color={orange[700]}>
          {formatDate(sunData.dusk)}
        </Pill>
      )}
      {sunData?.nauticalDusk && (
        <Pill label="Naut Dusk" color={orange[700]}>
          {formatDate(sunData.nauticalDusk)}
        </Pill>
      )}

      {moonData && moonData.phase && (
        <Pill label="Moon" color={blue[800]}>
          {/* todo moon icon */}
          <Text style={{ fontSize: 10 }}>{moonData.phase}</Text>
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
    marginBottom: 20,
  },
  date: {
    textTransform: 'lowercase',
  },
});

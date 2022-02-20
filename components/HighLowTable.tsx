import {
  SunDetailFieldsFragment,
  MoonDetailFieldsFragment,
  SolunarDetailFieldsFragment,
  SolunarPeriodFieldsFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pill from './Pill';
import { blue, orange, teal } from '../colors';
import Stars from './Stars';
import { useUserContext } from '../context/UserContext';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Props {
  hiLowData: any[];
  sunData?: SunDetailFieldsFragment;
  moonData: MoonDetailFieldsFragment;
  solunarData: SolunarDetailFieldsFragment;
}

const HighLowTable: React.FC<Props> = ({
  hiLowData,
  sunData,
  moonData,
  solunarData,
}) => {
  const { user } = useUserContext();
  const formatDate = (x: string) => (
    <Text style={styles.date}>{format(new Date(x), 'h:mma')}</Text>
  );

  const formatPeriod = (period: SolunarPeriodFieldsFragment) => (
    <View key={period.start}>
      <Text style={styles.smallerFont}>
        {format(new Date(period.start), 'h:mma')}-
        {format(new Date(period.end), 'h:mma')}
      </Text>
    </View>
  );

  // todo: marketing
  const premiumTeaser = () => (
    <View>
      <TouchableOpacity onPress={() => {}}>
        <Text>Premium Required</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Pill color={teal[600]} label={'Solunar Score'}>
        {user.entitledToPremium ? (
          <Stars score={solunarData.score} />
        ) : (
          premiumTeaser()
        )}
      </Pill>

      <Pill color={teal[600]} label={'Major Feeding'}>
        {user.entitledToPremium
          ? solunarData.majorPeriods.map((period) => {
              return formatPeriod(period);
            })
          : premiumTeaser()}
      </Pill>

      <Pill color={teal[600]} label={'Minor Feeding'}>
        {user.entitledToPremium
          ? solunarData.minorPeriods.map((period) => {
              return formatPeriod(period);
            })
          : premiumTeaser()}
      </Pill>

      {sunData?.nauticalDawn && (
        <Pill label="Nautical Dawn" color={orange[700]}>
          {formatDate(sunData.nauticalDawn)}
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
      {sunData?.nauticalDusk && (
        <Pill label="Nautical Dusk" color={orange[700]}>
          {formatDate(sunData.nauticalDusk)}
        </Pill>
      )}

      {hiLowData.map(({ x, type }, i) => (
        <Pill key={i} label={`${type} Tide`}>
          {formatDate(x)}
        </Pill>
      ))}

      {moonData && moonData.phase && (
        <Pill label="Moon" color={blue[800]}>
          {/* todo moon icon */}
          <Text style={styles.smallerFont}>{moonData.phase}</Text>
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
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  date: {
    textTransform: 'lowercase',
    width: '100%',
    fontSize: 16,
    textAlign: 'center',
  },
  smallerFont: {
    fontSize: 14,
  },
  valueText: {},
});

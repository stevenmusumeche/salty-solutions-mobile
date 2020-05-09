import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { startOfDay, subHours } from 'date-fns';
import React, { useContext, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import ConditionCard from './ConditionCard';
import { AppContext } from '../context/AppContext';
import BigBlue from './BigBlue';
import Graph from './Graph';
import LoaderBlock from './LoaderBlock';
import { ErrorIcon } from './FullScreenError';

const AirTempCard: React.FC<{ requestRefresh: boolean }> = ({
  requestRefresh,
}) => {
  const headerText = 'Air Temperature (F)';

  const { activeLocation } = useContext(AppContext);
  const date = startOfDay(new Date());
  const {
    curValue,
    curDetail,
    fetching,
    error,
    refresh,
  } = hooks.useTemperatureData(activeLocation.id, subHours(date, 48), date);

  useEffect(() => {
    if (requestRefresh) {
      refresh({ requestPolicy: 'network-only' });
    }
  }, [requestRefresh, refresh]);

  if (fetching) {
    return (
      <ConditionCard headerText={headerText}>
        <LoaderBlock />
      </ConditionCard>
    );
  }

  if (error) {
    return (
      <ConditionCard headerText={headerText}>
        <View style={styles.errorWrapper}>
          <ErrorIcon />
        </View>
      </ConditionCard>
    );
  }

  return (
    <ConditionCard headerText={headerText}>
      <BigBlue>{curValue}</BigBlue>
      {curDetail && <Graph data={curDetail} />}
    </ConditionCard>
  );
};

export default AirTempCard;

const styles = StyleSheet.create({
  errorWrapper: {
    justifyContent: 'center',
    flex: 1,
  },
});

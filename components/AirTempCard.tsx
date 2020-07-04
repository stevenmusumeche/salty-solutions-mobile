import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { subHours } from 'date-fns';
import React, { useContext, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import BigBlue from './BigBlue';
import ConditionCard from './ConditionCard';
import { ErrorIcon } from './FullScreenError';
import Graph from './Graph';
import LoaderBlock from './LoaderBlock';
import NoData from './NoData';

interface Props {
  requestRefresh: boolean;
}

const AirTempCard: React.FC<Props> = ({ requestRefresh }) => {
  const headerText = 'Air Temperature (F)';

  const { activeLocation } = useContext(AppContext);

  const date = useMemo(() => new Date(), []);
  const {
    curValue,
    curDetail,
    fetching,
    error,
    refresh,
  } = hooks.useTemperatureData({
    locationId: activeLocation.id,
    startDate: subHours(date, 48),
    endDate: date,
  });

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
      {curValue ? (
        <>
          <BigBlue>{curValue}</BigBlue>
          {curDetail && <Graph data={curDetail} />}
        </>
      ) : (
        <NoData />
      )}
      <View style={styles.spacer} />
    </ConditionCard>
  );
};

export default AirTempCard;

const styles = StyleSheet.create({
  errorWrapper: {
    justifyContent: 'center',
    flex: 1,
  },
  usgsWrapper: {
    marginTop: 10,
    width: '100%',
  },
  spacer: {
    height: 19.3,
    width: 50,
    marginTop: 10,
  },
});

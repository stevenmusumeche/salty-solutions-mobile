import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { startOfDay, subHours } from 'date-fns';
import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import ConditionCard from './ConditionCard';
import { AppContext } from '../context/AppContext';
import BigBlue from './BigBlue';
import Graph from './Graph';
import LoaderBlock from './LoaderBlock';
import { UsgsSiteDetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import UsgsSiteSelect from './UsgsSiteSelect';
import { ErrorIcon } from './FullScreenError';

interface Props {
  usgsSites: UsgsSiteDetailFragment[];
  requestRefresh: boolean;
}

const WaterTempCard: React.FC<Props> = ({ usgsSites, requestRefresh }) => {
  const headerText = 'Water Temperature (F)';

  const { activeLocation } = useContext(AppContext);
  const [selectedUsgsSiteId, setSelectedUsgsSiteId] = useState(usgsSites[0].id);

  const date = startOfDay(new Date());
  const {
    curValue,
    curDetail,
    fetching,
    error,
    refresh,
  } = hooks.useWaterTemperatureData(
    activeLocation.id,
    selectedUsgsSiteId,
    subHours(date, 48),
    date,
  );

  useEffect(() => {
    setSelectedUsgsSiteId(usgsSites[0].id);
  }, [usgsSites]);

  useEffect(() => {
    if (requestRefresh) {
      refresh({ requestPolicy: 'network-only' });
    }
  }, [requestRefresh, refresh]);

  if (!fetching && error) {
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
      {fetching ? (
        <LoaderBlock />
      ) : (
        <>
          <BigBlue>{curValue}</BigBlue>
          {curDetail && <Graph data={curDetail} />}
        </>
      )}

      {usgsSites.length > 1 && (
        <View style={styles.usgsWrapper}>
          <UsgsSiteSelect
            sites={usgsSites}
            handleChange={(itemValue) => setSelectedUsgsSiteId(itemValue)}
            selectedId={selectedUsgsSiteId}
          />
        </View>
      )}
    </ConditionCard>
  );
};

export default WaterTempCard;

const styles = StyleSheet.create({
  usgsWrapper: {
    marginTop: 10,
  },
  errorWrapper: {
    justifyContent: 'center',
    flex: 1,
  },
});

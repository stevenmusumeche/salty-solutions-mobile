import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { startOfDay, subHours } from 'date-fns';
import React, { useContext, useState, useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import ConditionCard from './ConditionCard';
import { AppContext } from '../context/AppContext';
import BigBlue from './BigBlue';
import Graph from './Graph';
import LoaderBlock from './LoaderBlock';
import { UsgsSiteDetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import UsgsSiteSelect from './UsgsSiteSelect';

interface Props {
  usgsSites: UsgsSiteDetailFragment[];
}

const WaterTempCard: React.FC<Props> = ({ usgsSites }) => {
  const headerText = 'Water Temperature (F)';

  const { activeLocation } = useContext(AppContext);
  const [selectedUsgsSiteId, setSelectedUsgsSiteId] = useState(usgsSites[0].id);

  const date = startOfDay(new Date());
  const {
    curValue,
    curDetail,
    fetching,
    error,
  } = hooks.useWaterTemperatureData(
    activeLocation.id,
    selectedUsgsSiteId,
    subHours(date, 48),
    date,
  );

  useEffect(() => {
    setSelectedUsgsSiteId(usgsSites[0].id);
  }, [usgsSites]);

  if (fetching) {
    return (
      <ConditionCard headerText={headerText}>
        <LoaderBlock />
      </ConditionCard>
    );
  }

  if (error) {
    return <Text>Error</Text>;
  }

  return (
    <ConditionCard headerText={headerText}>
      <BigBlue>{curValue}</BigBlue>
      {curDetail && <Graph data={curDetail} />}
      <View style={styles.usgsWrapper}>
        <UsgsSiteSelect
          sites={usgsSites}
          handleChange={(itemValue) => setSelectedUsgsSiteId(itemValue)}
          selectedId={selectedUsgsSiteId}
        />
      </View>
    </ConditionCard>
  );
};

export default WaterTempCard;

const styles = StyleSheet.create({
  usgsWrapper: {
    marginTop: 10,
  },
});

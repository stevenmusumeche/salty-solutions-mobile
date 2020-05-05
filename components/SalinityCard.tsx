import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { UsgsSiteDetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { startOfDay, subHours } from 'date-fns';
import React, { useContext, useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Card from '../components/Card';
import { AppContext } from '../context/AppContext';
import BigBlue from './BigBlue';
import Graph from './Graph';
import LoaderBlock from './LoaderBlock';
import UsgsSiteSelect from './UsgsSiteSelect';

interface Props {
  usgsSites: UsgsSiteDetailFragment[];
}

const SalinityCard: React.FC<Props> = ({ usgsSites }) => {
  const headerText = 'Salinity';

  const { activeLocation } = useContext(AppContext);
  const [selectedUsgsSiteId, setSelectedUsgsSiteId] = useState(usgsSites[0].id);

  const date = startOfDay(new Date());
  const { curValue, curDetail, fetching, error } = hooks.useSalinityData(
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
      <Card headerText={headerText}>
        <LoaderBlock />
      </Card>
    );
  }

  if (error) {
    return <Text>Error</Text>;
  }

  return (
    <Card headerText={headerText}>
      <BigBlue>{curValue}</BigBlue>
      {curDetail && <Graph data={curDetail} />}
      <View style={styles.usgsWrapper}>
        <UsgsSiteSelect
          sites={usgsSites}
          handleChange={(itemValue) => setSelectedUsgsSiteId(itemValue)}
          selectedId={selectedUsgsSiteId}
        />
      </View>
    </Card>
  );
};

export default SalinityCard;

const styles = StyleSheet.create({
  usgsWrapper: {
    marginTop: 10,
  },
});

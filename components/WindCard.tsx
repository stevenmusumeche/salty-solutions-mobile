import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { startOfDay, subHours } from 'date-fns';
import React, { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { blue } from '../colors';
import Card from '../components/Card';
import { AppContext } from '../context/AppContext';
import BigBlue from './BigBlue';
import Graph from './Graph';
import LoaderBlock from './LoaderBlock';

const WindCard: React.FC = () => {
  const headerText = 'Wind (mph)';

  const { activeLocation } = useContext(AppContext);
  const date = startOfDay(new Date());
  const {
    curValue,
    curDirectionValue,
    fetching,
    curDetail,
    error,
  } = hooks.useCurrentWindData(activeLocation.id, subHours(date, 48), date);

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
      <View style={styles.directionWrapper}>
        <Text style={styles.directionText}>{curDirectionValue}</Text>
      </View>
      {curDetail && <Graph data={curDetail} />}
    </Card>
  );
};

export default WindCard;

const styles = StyleSheet.create({
  directionWrapper: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  directionText: {
    color: blue[800],
    fontSize: 18,
  },
  graph: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5fcff',
  },
});

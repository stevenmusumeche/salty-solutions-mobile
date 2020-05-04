import { startOfDay, subHours } from 'date-fns';
import React, { useContext, useState, useEffect } from 'react';
import { Text, View, StyleSheet, useWindowDimensions } from 'react-native';
import { blue } from '../colors';
import Card from '../components/Card';
import { AppContext } from '../context/AppContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';
import BigBlue from './BigBlue';
import LoaderBlock from './LoaderBlock';
import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { VictoryChart, VictoryBar, VictoryLine } from 'victory-native';

const WindCard: React.FC = () => {
  useLocationSwitcher();
  useHeaderTitle('Current Conditions');
  const windowWidth = useWindowDimensions().width;

  console.log(windowWidth);

  const headerText = 'Wind (mph)';

  const { activeLocation } = useContext(AppContext);
  const date = startOfDay(new Date());
  const { curValue, curDirectionValue, fetching } = hooks.useCurrentWindData(
    activeLocation.id,
    subHours(date, 48),
    date,
  );

  if (fetching) {
    return (
      <Card headerText={headerText}>
        <LoaderBlock />
      </Card>
    );
  }

  return (
    <Card headerText={headerText}>
      <BigBlue>{curValue}</BigBlue>
      <View style={styles.directionWrapper}>
        <Text style={styles.directionText}>{curDirectionValue}</Text>
      </View>
      <View style={{ width: '100%' }}>
        <VictoryChart
          padding={30}
          domain={{ x: [0, 4] }}
          width={windowWidth / 2 - 30}
          height={170}
          style={{ parent: { borderColor: 'green', borderWidth: 1 } }}
        >
          <VictoryBar
            style={{ data: { fill: 'red' } }}
            data={[
              { x: 1, y: 2 },
              { x: 2, y: 4 },
              { x: 3, y: 6 },
            ]}
          />
        </VictoryChart>
      </View>
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

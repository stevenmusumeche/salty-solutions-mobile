import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { startOfDay, subHours } from 'date-fns';
import React, { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Text as SvgText } from 'react-native-svg';
import { blue } from '../colors';
import Card from '../components/Card';
import { AppContext } from '../context/AppContext';
import BigBlue from './BigBlue';
import Graph from './Graph';
import LoaderBlock from './LoaderBlock';
import { VictoryScatter } from 'victory-native';

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
      {curDetail && (
        <Graph data={curDetail}>
          <VictoryScatter dataComponent={<ArrowPoint />} />
        </Graph>
      )}
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

interface ArrowPointProps {
  x: number;
  y: number;
  datum: any;
  index: number;
}

const ArrowPoint: React.FC<ArrowPointProps | any> = ({
  x,
  y,
  datum,
  index,
}) => {
  const adjustedX = x - 5;
  const adjustedY = y + 3;
  const transformAngle = Math.abs(datum.directionDegrees + 180);

  if (index % 3 !== 0) {
    return null;
  }

  return (
    <SvgText
      x={adjustedX}
      y={adjustedY}
      fontSize={12}
      transform={`rotate(${transformAngle},${adjustedX},${adjustedY})`}
    >
      ↑
    </SvgText>
  );
};

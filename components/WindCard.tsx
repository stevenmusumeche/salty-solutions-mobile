import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { startOfDay, subHours } from 'date-fns';
import React, { useContext, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Text as SvgText } from 'react-native-svg';
import { blue } from '../colors';
import ConditionCard from './ConditionCard';
import { AppContext } from '../context/AppContext';
import BigBlue from './BigBlue';
import Graph from './Graph';
import LoaderBlock from './LoaderBlock';
import { VictoryScatter } from 'victory-native';
import { ErrorIcon } from './FullScreenError';

const WindCard: React.FC<{ requestRefresh: boolean }> = ({
  requestRefresh,
}) => {
  const headerText = 'Wind (mph)';

  const { activeLocation } = useContext(AppContext);
  const date = startOfDay(new Date());
  const {
    curValue,
    curDirectionValue,
    fetching,
    curDetail,
    error,
    refresh,
  } = hooks.useCurrentWindData(activeLocation.id, subHours(date, 48), date);

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
      <View style={styles.directionWrapper}>
        <Text style={styles.directionText}>{curDirectionValue}</Text>
      </View>
      {curDetail && (
        <Graph data={curDetail}>
          <VictoryScatter dataComponent={<ArrowPoint />} />
        </Graph>
      )}
    </ConditionCard>
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
  errorWrapper: {
    justifyContent: 'center',
    flex: 1,
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

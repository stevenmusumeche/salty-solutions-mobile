import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { startOfDay, subHours } from 'date-fns';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Text as SvgText, Path } from 'react-native-svg';
import { VictoryScatter } from 'victory-native';
import { blue } from '../colors';
import { AppContext } from '../context/AppContext';
import BigBlue from './BigBlue';
import ConditionCard from './ConditionCard';
import { ErrorIcon } from './FullScreenError';
import Graph from './Graph';
import LoaderBlock from './LoaderBlock';
import { UsgsSiteDetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import UsgsSiteSelect from './UsgsSiteSelect';

interface Props {
  usgsSites: UsgsSiteDetailFragment[];
  requestRefresh: boolean;
}

const WindCard: React.FC<Props> = ({ usgsSites, requestRefresh }) => {
  const headerText = 'Wind (mph)';

  const { activeLocation } = useContext(AppContext);
  const [selectedUsgsSiteId, setSelectedUsgsSiteId] = useState(() =>
    usgsSites.length ? usgsSites[0].id : undefined,
  );
  const date = startOfDay(new Date());
  const {
    curValue,
    curDirectionValue,
    fetching,
    curDetail,
    error,
    refresh,
  } = hooks.useCurrentWindData(
    activeLocation.id,
    subHours(date, 48),
    date,
    selectedUsgsSiteId,
  );

  useEffect(() => {
    setSelectedUsgsSiteId(usgsSites.length ? usgsSites[0].id : undefined);
  }, [usgsSites]);

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
      {selectedUsgsSiteId && usgsSites.length > 1 && (
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
  usgsWrapper: {
    marginTop: 10,
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
  index,
  datum,
  data,
}) => {
  const numEntries = data.length;
  if (index % Math.floor(numEntries / 8) !== 0) {
    return null;
  }

  const transformAngle = Math.abs(datum.directionDegrees + 180);
  const adjustedX = x - 5;
  const adjustedY = y - 10;

  return (
    <Path
      scale={0.05}
      x={adjustedX}
      y={adjustedY}
      d="m9.5,238.88542l90.5,-229.88542l90,231l-90,-50l-90.5,49z"
      fill="black"
      transform={`rotate(${transformAngle},110,125)`}
    />
  );
};

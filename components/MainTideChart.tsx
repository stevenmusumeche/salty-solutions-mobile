import {
  SunDetailFieldsFragment,
  TideDetailFieldsFragment,
  WaterHeightFieldsFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import {
  buildDatasets,
  Y_PADDING,
} from '@stevenmusumeche/salty-solutions-shared/dist/tide-helpers';
import { addHours, endOfDay, format, startOfDay } from 'date-fns';
import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryLine,
} from 'victory-native';
import { TideContext } from '../context/TideContext';
import { gray, blue } from '../colors';

interface Props {
  sunData: SunDetailFieldsFragment;
  tideData: TideDetailFieldsFragment[];
  waterHeightData: WaterHeightFieldsFragment[];
}

const MainTideChart: React.FC<Props> = ({
  sunData,
  tideData: rawTideData,
  waterHeightData: rawWaterHeightData,
}) => {
  const { date } = useContext(TideContext);
  const {
    dawn,
    dusk,
    daylight,
    tideData,
    waterHeightData,
    tideBoundaries,
  } = buildDatasets(sunData, rawTideData, rawWaterHeightData);
  const { min, max } = tideBoundaries;

  let timeTickValues = [];
  for (let i = 0; i <= 24; i += 4) {
    timeTickValues.push(addHours(startOfDay(date), i));
  }

  return (
    <View style={styles.container}>
      <VictoryChart
        height={250}
        style={{
          parent: { touchAction: 'auto' },
        }}
        padding={{
          top: 0,
          bottom: 30,
          left: 25,
          right: 55,
        }}
      >
        {/* background colors for night */}
        <VictoryArea
          data={[
            {
              x: startOfDay(date),
              y: max + Y_PADDING,
            },
            { x: endOfDay(date), y: max + Y_PADDING },
          ]}
          scale={{ x: 'time', y: 'linear' }}
          style={{
            data: {
              strokeWidth: 0,
              fill: gray[700],
            },
          }}
          y0={() => (min < 0 ? min - Y_PADDING : 0)}
        />

        {/* background colors for time periods like night, dusk, etc */}
        {renderBackgroundColor(daylight, blue[100], min)}
        {renderBackgroundColor(dawn, gray[500], min)}
        {renderBackgroundColor(dusk, gray[500], min)}

        {/* time x-axis */}
        <VictoryAxis
          style={{
            grid: {
              strokeWidth: 1,
              stroke: gray[600],
              strokeDasharray: '2 4',
            },
            tickLabels: { fontSize: 12, padding: 3 },
          }}
          tickFormat={(date) => format(new Date(date), 'ha').toLowerCase()}
          tickValues={timeTickValues}
          offsetY={30}
        />

        {/* tide height y-axis */}
        <VictoryAxis
          dependentAxis
          style={{
            grid: {
              stroke: gray[600],
              strokeWidth: (y) => (y === 0 && min < 0 ? 2 : 1),
              strokeDasharray: (y) => (y === 0 && min < 0 ? '12 6' : '2 10'),
            },
            tickLabels: { fontSize: 12, padding: 5 },
          }}
          tickCount={6}
          crossAxis={false}
        />

        {/* actual tide line */}
        <VictoryLine
          data={tideData}
          scale={{ x: 'time', y: 'linear' }}
          interpolation={'natural'}
          style={{
            data: {
              strokeWidth: 2,
              stroke: 'black',
            },
          }}
        />

        {/* observed water height */}
        <VictoryLine
          data={waterHeightData}
          scale={{ x: 'time', y: 'linear' }}
          interpolation={'natural'}
          style={{
            data: {
              strokeWidth: 2,
              stroke: blue[600],
            },
          }}
        />
      </VictoryChart>
    </View>
  );
};

export default MainTideChart;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: 10,
  },
});

export const renderBackgroundColor = (
  data: any[],
  color: string,
  minValue: number,
  maxValue?: number,
  key?: any,
) => {
  return (
    <VictoryArea
      key={key}
      data={data.map((datum) => {
        if (maxValue) {
          return { x: datum.x, y: maxValue };
        }
        return datum;
      })}
      scale={{ x: 'time', y: 'linear' }}
      style={{
        data: {
          strokeWidth: 0,
          fill: color,
        },
      }}
      y0={() => (minValue < 0 ? minValue - Y_PADDING : 0)}
    />
  );
};

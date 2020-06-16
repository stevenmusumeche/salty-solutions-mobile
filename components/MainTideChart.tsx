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
              fill: '#4a5568',
            },
          }}
          y0={() => (min < 0 ? min - Y_PADDING : 0)}
        />

        {/* background colors for time periods like night, dusk, etc */}
        {renderBackgroundColor(daylight, '#ebf8ff', min)}
        {renderBackgroundColor(dawn, '#a0aec0', min)}
        {renderBackgroundColor(dusk, '#a0aec0', min)}

        {/* time x-axis */}
        <VictoryAxis
          style={{
            grid: {
              strokeWidth: 1,
              stroke: '#718096',
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
              stroke: '#718096',
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
              stroke: '#3182ce',
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

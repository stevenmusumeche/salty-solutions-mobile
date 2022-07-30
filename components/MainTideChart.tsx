import {
  SunDetailFieldsFragment,
  TideDetailFieldsFragment,
  WaterHeightFieldsFragment,
  SolunarDetailFieldsFragment,
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
import { gray, blue, black } from '../colors';

interface Props {
  sunData: SunDetailFieldsFragment;
  tideData: TideDetailFieldsFragment[];
  waterHeightData: WaterHeightFieldsFragment[];
  solunarData?: SolunarDetailFieldsFragment;
}

const MainTideChart: React.FC<Props> = ({
  sunData,
  tideData: rawTideData,
  waterHeightData: rawWaterHeightData,
  solunarData,
}) => {
  const { date } = useContext(TideContext);
  const {
    dawn,
    dusk,
    daylight,
    tideData,
    waterHeightData,
    tideBoundaries,
    tidesWithinSolunarPeriod,
  } = buildDatasets(sunData, rawTideData, rawWaterHeightData, solunarData);
  const { min, max } = tideBoundaries;

  let timeTickValues = [];
  for (let i = 0; i <= 24; i += 3) {
    timeTickValues.push(addHours(startOfDay(date), i));
  }

  const y0 = min - Y_PADDING > 0 ? 0 : min - Y_PADDING;

  return (
    <View style={styles.container}>
      <VictoryChart
        height={200}
        style={{
          parent: { touchAction: 'auto' },
        }}
        padding={{
          top: 0,
          bottom: 30,
          left: 25,
          right: 35,
        }}
        domain={{ x: [startOfDay(date), endOfDay(date)] }}
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
          y0={() => y0}
        />

        {/* background colors for time periods like night, dusk, etc */}
        {renderBackgroundColor(daylight, blue[100], min)}
        {renderBackgroundColor(dawn, gray[500], min)}
        {renderBackgroundColor(dusk, gray[500], min)}

        {/* actual tide line */}
        <VictoryArea
          data={tideData}
          scale={{ x: 'time', y: 'linear' }}
          interpolation={'natural'}
          style={{
            data: {
              stroke: blue[800],
              strokeWidth: 2,
              fill: blue[650],
            },
          }}
          y0={() => y0}
        />

        {/* solunar periods */}
        {tidesWithinSolunarPeriod.map((tides, i) => (
          <VictoryArea
            key={i}
            data={tides}
            y0={() => y0}
            scale={{ x: 'time', y: 'linear' }}
            interpolation={'natural'}
            style={{
              data: {
                fill: 'rgba(255,255,255, .25)',
                stroke: blue[800],
                strokeWidth: 2,
              },
            }}
          />
        ))}

        {/* observed water height */}
        <VictoryLine
          data={waterHeightData}
          scale={{ x: 'time', y: 'linear' }}
          interpolation={'natural'}
          style={{
            data: {
              strokeWidth: 2,
              stroke: black,
            },
          }}
        />

        {/* time x-axis */}
        <VictoryAxis
          style={{
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
            tickLabels: { fontSize: 12, padding: 5 },
          }}
          tickCount={6}
          crossAxis={false}
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

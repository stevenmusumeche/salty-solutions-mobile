import {
  SunDetailFieldsFragment,
  TideDetailFieldsFragment,
  WaterHeightFieldsFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import {
  buildDatasets,
  Y_PADDING,
} from '@stevenmusumeche/salty-solutions-shared/dist/tide-helpers';
import {
  addDays,
  addHours,
  endOfDay,
  format,
  getHours,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  subDays,
} from 'date-fns';
import React, { useContext } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryLine,
} from 'victory-native';
import { renderBackgroundColor } from './MainTideChart';
import { TideContext } from '../context/TideContext';
import { blue, gray, white } from '../colors';

interface Props {
  sunData: SunDetailFieldsFragment[];
  tideData: TideDetailFieldsFragment[];
  waterHeightData: WaterHeightFieldsFragment[];
  numDays: number;
}

interface Entry {
  x: Date;
  y: number;
}

const MultiDayTideCharts: React.FC<Props> = ({
  sunData,
  tideData: rawTideData,
  waterHeightData: rawWaterHeightData,
  numDays,
}) => {
  const { date: activeDate, actions } = useContext(TideContext);
  const dayPadding = Math.floor(numDays / 2);

  const { tideData, waterHeightData, tideBoundaries } = buildDatasets(
    sunData[0], // not actually used here
    rawTideData.filter(
      (x) =>
        isAfter(new Date(x.time), subDays(activeDate, dayPadding)) &&
        isBefore(new Date(x.time), endOfDay(addDays(activeDate, dayPadding))),
    ),
    rawWaterHeightData.filter(
      (x) =>
        isAfter(new Date(x.timestamp), subDays(activeDate, dayPadding)) &&
        isBefore(
          new Date(x.timestamp),
          endOfDay(addDays(activeDate, dayPadding)),
        ),
    ),
  );
  const { min, max } = tideBoundaries;

  let daylights: Entry[][] = [];
  let timeTickValues = [];
  for (let i = -1 * dayPadding; i <= dayPadding; i++) {
    const curDate = subDays(new Date(activeDate), i);

    // filter data for current date
    const curSunData = sunData.filter(
      (x) =>
        startOfDay(new Date(x.sunrise)).toISOString() ===
        startOfDay(curDate).toISOString(),
    )[0];

    if (!curSunData) {
      continue;
    }

    const curDayWaterHeight = rawWaterHeightData.filter((x) => {
      return isSameDay(new Date(x.timestamp), curDate);
    });

    const curDayTides = rawTideData.filter((x) =>
      isSameDay(new Date(x.time), curDate),
    );

    const { daylight } = buildDatasets(
      curSunData,
      curDayTides,
      curDayWaterHeight,
    );

    daylights.push(daylight);

    timeTickValues.push(startOfDay(curDate));
    timeTickValues.push(addHours(startOfDay(curDate), 12));
  }

  return (
    <View style={styles.container}>
      <View style={styles.clickableOverlay}>
        <TouchableOpacity
          style={styles.clickable}
          onPress={() => actions.setDate(addDays(activeDate, -1))}
        />
        <TouchableOpacity
          style={styles.clickable}
          onPress={() => actions.setDate(addDays(activeDate, 1))}
        />
      </View>
      <VictoryChart
        height={130}
        style={{
          parent: { touchAction: 'auto' },
        }}
        padding={{
          top: 0,
          bottom: 50,
          left: 25,
          right: 55,
        }}
      >
        {/* background colors for night */}
        <VictoryArea
          data={[
            {
              x: startOfDay(subDays(activeDate, dayPadding)),
              y: max + Y_PADDING,
            },
            {
              x: endOfDay(addDays(activeDate, dayPadding)),
              y: max + Y_PADDING,
            },
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
        {daylights.map((daylight, i) =>
          renderBackgroundColor(daylight, blue[100], min, max + Y_PADDING, i),
        )}

        {/* time x-axis */}
        <VictoryAxis
          style={{
            grid: {
              // only show gridlines on midnight
              strokeWidth: (date) =>
                getHours(new Date(date.tickValue)) === 0 ? 1 : 0,
              stroke: white,
            },
            tickLabels: { fontSize: 12, padding: 3 },
          }}
          // only show label at noon (center of the day block)
          tickFormat={(date) =>
            getHours(new Date(date)) === 12
              ? format(new Date(date), 'EEEE (M/d)')
              : ''
          }
          tickValues={timeTickValues}
          offsetY={50}
        />

        {/* tide height y-axis */}
        <VictoryAxis
          dependentAxis
          style={{
            tickLabels: { fontSize: 12, padding: 5 },
          }}
          tickCount={3}
          crossAxis={false}
        />

        {/* actual tide line */}
        <VictoryLine
          name="tideData"
          data={tideData}
          scale={{ x: 'time', y: 'linear' }}
          interpolation={'natural'}
          style={{
            data: {
              strokeWidth: 1,
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
              strokeWidth: 1,
              stroke: blue[600],
            },
          }}
        />
      </VictoryChart>
    </View>
  );
};

export default MultiDayTideCharts;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: -10,
  },
  clickableOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 25,
    marginRight: 15,
    zIndex: 1,
  },
  clickable: { width: '33%' },
});

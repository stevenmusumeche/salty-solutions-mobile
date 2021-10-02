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
import { blue, gray, white, black } from '../colors';
import { trackEvent } from '../context/AppContext';

interface Props {
  sunData: SunDetailFieldsFragment[];
  tideData: TideDetailFieldsFragment[];
  waterHeightData: WaterHeightFieldsFragment[];
  numDays: number;
  solunarData: SolunarDetailFieldsFragment[];
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
  solunarData: rawSolunarData,
}) => {
  const { date: activeDate, actions } = useContext(TideContext);
  const dayPadding = Math.floor(numDays / 2);
  const rangeStartDate = subDays(activeDate, dayPadding);
  const rangeEndDate = endOfDay(addDays(activeDate, dayPadding));

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
  let solunars: any[][] = [];
  let midnights: Date[] = [];
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

    const curDaySolunarData: SolunarDetailFieldsFragment =
      rawSolunarData.filter((x) => isSameDay(new Date(x.date), curDate))[0] ||
      {};

    const { daylight, tidesWithinSolunarPeriod } = buildDatasets(
      curSunData,
      curDayTides,
      curDayWaterHeight,
      curDaySolunarData,
    );

    daylights.push(daylight);
    solunars.push(tidesWithinSolunarPeriod);
    midnights.push(endOfDay(curDate));

    timeTickValues.push(startOfDay(curDate));
    timeTickValues.push(addHours(startOfDay(curDate), 12));
  }

  const y0 = min < 0 ? min - Y_PADDING : 0;

  return (
    <View style={styles.container}>
      <View style={styles.clickableOverlay}>
        <TouchableOpacity
          style={styles.clickable}
          onPress={() => {
            trackEvent('Change Tide Date', { direction: 'back' });
            return actions.setDate(addDays(activeDate, -1));
          }}
        />
        <TouchableOpacity
          style={styles.clickable}
          onPress={() => {
            trackEvent('Change Tide Date', { direction: 'forward' });
            return actions.setDate(addDays(activeDate, 1));
          }}
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
          right: 35,
        }}
        domain={{
          x: [rangeStartDate, rangeEndDate],
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
          y0={() => y0}
        />

        {/* background colors for time periods like night, dusk, etc */}
        {daylights.map((daylight, i) =>
          renderBackgroundColor(daylight, blue[100], min, max + Y_PADDING, i),
        )}

        {/* time x-axis */}
        <VictoryAxis
          style={{
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
        <VictoryArea
          name="tideData"
          data={tideData}
          scale={{ x: 'time', y: 'linear' }}
          interpolation={'natural'}
          style={{
            data: {
              strokeWidth: 1,
              stroke: blue[800],
              fill: blue[650],
            },
          }}
          y0={() => y0}
        />

        {/* solunar periods */}
        {solunars.map((solunar, j) =>
          solunar.map((tides, i) => (
            <VictoryArea
              key={`${j}-${i}`}
              data={tides}
              scale={{ x: 'time', y: 'linear' }}
              interpolation={'natural'}
              style={{
                data: {
                  fill: 'rgba(255,255,255, .25)',
                  stroke: blue[800],
                  strokeWidth: 1,
                },
              }}
              y0={() => y0}
            />
          )),
        )}

        {/* observed water height */}
        <VictoryLine
          data={waterHeightData}
          scale={{ x: 'time', y: 'linear' }}
          interpolation={'natural'}
          style={{
            data: {
              strokeWidth: 1,
              stroke: black,
            },
          }}
        />

        {midnights.map((midnight) => (
          <VictoryLine
            key={midnight.toISOString()}
            /* @ts-ignore */
            x={() => midnight}
            style={{ data: { stroke: white, strokeWidth: 2 } }}
          />
        ))}
      </VictoryChart>
    </View>
  );
};

export default MultiDayTideCharts;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    marginBottom: -25,
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

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import {
  TideDetailFieldsFragment,
  SunDetailFieldsFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { isSameDay, startOfDay, addHours, format, endOfDay } from 'date-fns';
import {
  buildDatasets,
  Y_PADDING,
} from '@stevenmusumeche/salty-solutions-shared/dist/tide-helpers';
import { VictoryChart, VictoryAxis, VictoryArea } from 'victory-native';
import { renderBackgroundColor } from './MainTideChart';
import ChartLabelSwatch from './ChartLabelSwatch';

interface Props {
  stationName: string;
  tideData: TideDetailFieldsFragment[];
  sunData: SunDetailFieldsFragment[];
  date: Date;
}

const ForecastTide: React.FC<Props> = ({
  tideData: rawTideData,
  sunData,
  date,
  stationName,
}) => {
  const { width } = useWindowDimensions();
  const curDayTideData = useMemo(
    () => rawTideData.filter((x) => isSameDay(new Date(x.time), date)),
    [rawTideData, date],
  );

  const curDaySunData: SunDetailFieldsFragment = useMemo(
    () =>
      sunData.filter(
        (x) =>
          startOfDay(new Date(x.sunrise)).toISOString() ===
          startOfDay(date).toISOString(),
      )[0] || {},
    [sunData, date],
  );

  const yTickVals = useMemo(
    () => [0, 3, 6, 9, 12, 15, 18, 21].map((h) => addHours(date, h)),
    [date],
  );

  const { tideData, tideBoundaries, daylight } = useMemo(
    () => buildDatasets(curDaySunData, curDayTideData, []),
    [curDaySunData, curDayTideData],
  );
  const { min, max } = tideBoundaries;

  return (
    <View style={styles.container}>
      <VictoryChart
        height={180}
        width={width - 10}
        style={{
          parent: {
            backgroundColor: 'white',
            touchAction: 'auto',
          },
        }}
        padding={{
          top: 20,
          bottom: 30,
          left: 25,
          right: 25,
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
        {renderBackgroundColor(daylight, '#f7fafc', min)}

        {/* time x-axis */}
        <VictoryAxis
          style={{
            tickLabels: { fontSize: 12, padding: 3 },
          }}
          tickFormat={(date) => {
            const d = new Date(date);
            if (d.getHours() === 12) {
              return format(d, 'b');
            }
            return format(d, 'haaaaa');
          }}
          tickValues={yTickVals}
          offsetY={30}
        />

        {/* tide height y-axis */}
        <VictoryAxis
          dependentAxis
          style={{
            tickLabels: { fontSize: 12, padding: 3 },
          }}
          crossAxis={false}
        />

        {/* actual tide line */}
        <VictoryArea
          data={tideData}
          y0={() => (min < 0 ? min - Y_PADDING : 0)}
          scale={{ x: 'time', y: 'linear' }}
          interpolation={'natural'}
          style={{
            data: {
              stroke: '#2c5282',
              strokeWidth: 1,
              fill: '#5f8dc1',
            },
          }}
        />
      </VictoryChart>
      <ChartLegend stationName={stationName} />
    </View>
  );
};

export default ForecastTide;

const ChartLegend: React.FC<{ stationName: string }> = ({ stationName }) => {
  return (
    <View style={styles.chartLabelWrapper}>
      <View style={styles.chartLabelInnerWrapper}>
        <ChartLabelSwatch color="#5f8dc1" />
        <Text style={styles.chartLabelText}>Tides for {stationName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginTop: 4,
  },
  chartLabelWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  chartLabelInnerWrapper: {
    marginRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartLabelText: {
    textTransform: 'uppercase',
    color: '#718096',
    fontSize: 10,
    letterSpacing: -0.3,
  },
});

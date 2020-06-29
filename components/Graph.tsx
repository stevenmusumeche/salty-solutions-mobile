import { differenceInDays } from 'date-fns';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryLine,
} from 'victory-native';
import { yellow, gray } from '../colors';

interface Props {
  data: {
    y: number;
    x: string;
    [other: string]: any;
  }[];
  dependentAxisNumDecimals?: number;
}

const Graph: React.FC<Props> = ({ data, children }) => {
  const windowWidth = useWindowDimensions().width;

  // reduce the number of data points to display on the graph
  const mod = Math.ceil(data.length / 72);
  if (mod > 1) {
    data = data.filter((_: any, i: number) => i % mod === 0);
  }

  return (
    <View style={styles.container}>
      <VictoryChart
        padding={{ left: 21, top: 10, right: 10, bottom: 12 }}
        domainPadding={{ y: [30, 30] }}
        height={140}
        width={windowWidth / 2 - 50}
      >
        <VictoryAxis
          fixLabelOverlap={false}
          tickCount={2}
          tickFormat={(date: string) => {
            const dayDiff = differenceInDays(new Date(date), new Date());
            return dayDiff === 0 ? 'now' : `${dayDiff}d`;
          }}
          style={{
            tickLabels: { fontSize: 11, padding: 1 },
            grid: { stroke: gray[500], strokeDasharray: '6, 6' },
          }}
        />
        <VictoryAxis
          scale={{ x: 'time' }}
          dependentAxis
          style={{ tickLabels: { fontSize: 11, padding: 3 } }}
          tickFormat={(x, i, ticks) => {
            // if the ticks with no decimals contain duplicates, then use a decimal
            const withNoDecimals = ticks.map((tick) => tick.toFixed(0));
            if (withNoDecimals.length > new Set([...withNoDecimals]).size) {
              return x.toFixed(1);
            }
            return x.toFixed(0);
          }}
        />
        <VictoryGroup data={data}>
          <VictoryLine
            interpolation="natural"
            style={{
              data: { stroke: yellow[700], strokeWidth: 1 },
            }}
          />
          {children}
        </VictoryGroup>
      </VictoryChart>
    </View>
  );
};

export default Graph;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
});

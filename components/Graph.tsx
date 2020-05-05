import { differenceInDays } from 'date-fns';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import {
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryLine,
} from 'victory-native';

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
            grid: { stroke: '#a0aec0', strokeDasharray: '6, 6' },
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
              data: { stroke: '#C68E37', strokeWidth: 1 },
              parent: { border: '1px solid #ccc' },
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

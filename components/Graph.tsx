import { differenceInHours, format } from 'date-fns';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryLine,
} from 'victory-native';
import { gray, yellow } from '../colors';

interface Props {
  data: {
    y: number;
    x: string;
    [other: string]: any;
  }[];
  dependentAxisNumDecimals?: number;
  fullScreen?: boolean;
  onPress?: () => void;
  width?: number;
  height?: number;
  tickCount?: number;
}

const Graph: React.FC<Props> = ({
  data,
  children,
  fullScreen = false,
  onPress,
  width,
  height,
  tickCount = 2,
}) => {
  const { width: windowWidth } = useWindowDimensions();

  // reduce the number of data points to display on the graph
  const mod = Math.ceil(data.length / 72);
  if (mod > 1) {
    data = data.filter((_: any, i: number) => i % mod === 0);
  }

  const chartWidth = width ?? windowWidth / 2 - 50;
  const chartHeight = height ?? 140;

  return (
    <View style={styles.container}>
      {wrapWithTouchable(
        <VictoryChart
          padding={{
            left: 23,
            top: 10,
            right: 10,
            bottom: fullScreen ? 24 : 12,
          }}
          domainPadding={{ y: [30, 30] }}
          height={chartHeight - (fullScreen ? 60 : 0)}
          width={chartWidth}
        >
          <VictoryAxis
            fixLabelOverlap={false}
            tickCount={tickCount}
            tickFormat={(date: string) => {
              const dateObj = new Date(date);
              if (fullScreen) {
                return format(dateObj, 'ccc') + '\n' + format(dateObj, 'ha');
              }

              const hourDiff = Math.abs(differenceInHours(dateObj, new Date()));
              if (hourDiff >= 46) {
                return '-2d';
              } else if (hourDiff >= 18) {
                return '-1d';
              }
              return 'now';
            }}
            style={{
              tickLabels: { fontSize: 11, padding: 1 },
              grid: {
                stroke: gray[500],
                strokeDasharray: '6, 6',
                strokeWidth: fullScreen ? 0.5 : 1,
              },
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
                data: {
                  stroke: yellow[700],
                  strokeWidth: fullScreen ? 2 : 1,
                },
              }}
            />
            {children}
          </VictoryGroup>
        </VictoryChart>,
        onPress,
      )}
    </View>
  );
};

export default Graph;

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

function wrapWithTouchable(children: any, onPress?: () => void) {
  if (!onPress) {
    return children;
  }

  return <TouchableOpacity onPress={onPress}>{children}</TouchableOpacity>;
}

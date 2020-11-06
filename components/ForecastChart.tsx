import { prepareForecastData } from '@stevenmusumeche/salty-solutions-shared/dist/forecast-helpers';
import { CombinedForecastV2DetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { addHours, format } from 'date-fns';
import React, { FC, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View, Text } from 'react-native';
import { Path } from 'react-native-svg';
import {
  VictoryAxis,
  VictoryBar,
  VictoryChart,
  VictoryGroup,
  VictoryScatter,
  VictoryStack,
} from 'victory-native';
import ChartLabelSwatch from './ChartLabelSwatch';
import { blue, gray, red } from '../colors';

const WIND_WARNING_MIN = 25;

interface Props {
  data: CombinedForecastV2DetailFragment;
  date: Date;
}

const ForecastChart: React.FC<Props> = ({ data, date }) => {
  const { width } = useWindowDimensions();
  const { chartData } = useMemo(() => prepareForecastData(data, date), [
    data,
    date,
  ]);
  const hasAnyData = useMemo(
    () => !(chartData.find((x) => x.y !== undefined) === undefined),
    [chartData],
  );
  const yTickVals = useMemo(
    () => [0, 3, 6, 9, 12, 15, 18, 21].map((h) => addHours(date, h)),
    [date],
  );

  if (!hasAnyData) {
    return <EmptyChart yTickVals={yTickVals} />;
  }

  const maxWind = Math.max(...chartData.map((datum) => datum.gustY + datum.y));

  return (
    <View style={styles.container}>
      <VictoryChart
        padding={{ left: 25, top: 35, right: 25, bottom: 30 }}
        domainPadding={{ y: 10, x: 7 }}
        style={{ parent: { touchAction: 'auto' } }}
        height={180}
        width={width - 10}
        maxDomain={{
          y: maxWind > WIND_WARNING_MIN ? maxWind : WIND_WARNING_MIN,
        }}
      >
        <VictoryAxis
          scale={{ x: 'time' }}
          dependentAxis
          style={{
            tickLabels: { fontSize: 12, padding: 3 },
          }}
          tickFormat={noDecimals}
        />

        <VictoryAxis
          fixLabelOverlap={false}
          tickValues={yTickVals}
          tickFormat={(date) => {
            const d = new Date(date);
            if (d.getHours() === 12) {
              return format(d, 'b');
            }
            return format(d, 'haaaaa');
          }}
          style={{
            tickLabels: { fontSize: 12, padding: 3 },
          }}
        />

        <VictoryStack>
          <VictoryGroup data={chartData}>
            <VictoryBar
              style={{
                data: {
                  width: 10,
                  fill: ({ datum }) => {
                    return datum.y + datum.gustY >= WIND_WARNING_MIN
                      ? red[700]
                      : blue[700];
                  },
                },
              }}
            />

            <VictoryScatter dataComponent={<ArrowPoint />} />
          </VictoryGroup>
          <VictoryBar
            data={chartData}
            y="gustY"
            style={{
              data: {
                width: 10,
                fill: ({ datum }) => {
                  return datum.y + datum.gustY >= WIND_WARNING_MIN
                    ? red[700]
                    : blue[700];
                },
                fillOpacity: ({ datum }) => {
                  return datum.y + datum.gustY >= WIND_WARNING_MIN ? 0.2 : 0.3;
                },
              },
            }}
          />
        </VictoryStack>
        <VictoryScatter
          data={chartData}
          y="ySum"
          dataComponent={<RainDrop />}
        />
      </VictoryChart>
      <ChartLegend />
    </View>
  );
};

export default ForecastChart;

// todo
const EmptyChart: FC<{ yTickVals: Date[] }> = ({ yTickVals }) => <View></View>;

function noDecimals(x: any) {
  return x.toFixed(0);
}

interface ArrowPointProps {
  x: number;
  y: number;
  datum: any;
  index: number;
}

const RainDrop: React.FC<any> = ({ x, y, datum, index, data, ...props }) => {
  if (datum.rain === 0) {
    return null;
  }

  const renderDrop = (xOffset: number, yOffset: number, scale = 0.05) => (
    <Path
      scale={scale}
      d="m80.5,7.11458c-3.14918,-0.14918 -152,228 -1,228c151,0 4.14918,-227.85081 1,-228z"
      fill={blue[500]}
      x={x - xOffset}
      y={y - yOffset}
    />
  );

  let numDrops = 1;
  if (datum.rain >= 6) {
    numDrops = 3;
  } else if (datum.rain >= 3) {
    numDrops = 2;
  }

  if (numDrops === 1) {
    return <>{renderDrop(4, 15)}</>;
  } else if (numDrops === 2) {
    return (
      <>
        {renderDrop(5, 15)}
        {renderDrop(-1, 17, 0.028)}
      </>
    );
  } else {
    return (
      <>
        {renderDrop(5, 15)}
        {renderDrop(-1, 17, 0.028)}
        {renderDrop(1.2, 20, 0.02)}
      </>
    );
  }
};

const ArrowPoint: React.FC<ArrowPointProps | any> = ({ x, index, datum }) => {
  if (index % 2 !== 1) {
    return null;
  }

  const transformAngle = Math.abs(datum.directionDegrees + 180);
  const adjustedX = x - 5;
  const adjustedY = 10;

  return (
    <Path
      scale={0.05}
      x={adjustedX}
      y={adjustedY}
      d="m9.5,238.88542l90.5,-229.88542l90,231l-90,-50l-90.5,49z"
      fill={gray[800]}
      transform={`rotate(${transformAngle},110,125)`}
    />
  );
};

const ChartLegend: React.FC = () => {
  return (
    <View style={styles.chartLabelWrapper}>
      <View style={styles.chartLabelInnerWrapper}>
        <ChartLabelSwatch color={blue[700]} />
        <Text style={[styles.chartLabelText, { marginRight: 10 }]}>Wind</Text>
        <ChartLabelSwatch color={blue[700]} opacity={0.3} />
        <Text style={styles.chartLabelText}>Gusts</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
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
    color: gray[600],
    fontSize: 10,
    letterSpacing: -0.3,
  },
});

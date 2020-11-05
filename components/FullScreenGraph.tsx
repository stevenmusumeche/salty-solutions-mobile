import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { VictoryScatter } from 'victory-native';
import { white } from '../colors';
import { NowStackParams } from '../screens/NowScreen';
import Graph from './Graph';
import { ArrowPoint } from './WindCard';

interface Props {
  route: RouteProp<NowStackParams, 'FullScreenGraph'>;
  navigation: StackNavigationProp<NowStackParams, 'FullScreenGraph'>;
}

const FullScreenGraph: React.FC<Props> = ({ route, navigation }) => {
  const { width: windowWidth } = useWindowDimensions();
  navigation.setOptions({ title: route.params.title });

  const width = windowWidth - 20;
  const height = width * 0.9;

  return (
    <View style={styles.container}>
      {route.params.siteName && (
        <View style={styles.siteWrapper}>
          <Text style={styles.siteText}>{route.params.siteName}</Text>
        </View>
      )}
      <Graph
        data={route.params.data}
        fullScreen={true}
        width={width}
        height={height}
        tickCount={8}
      >
        {route.params.includeArrows && (
          <VictoryScatter dataComponent={<ArrowPoint fullScreen={true} />} />
        )}
      </Graph>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: white,
    paddingTop: 20,
  },
  siteWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 15,
  },
  siteText: { fontSize: 15 },
});

export default FullScreenGraph;

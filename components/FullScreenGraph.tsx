import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  navigation.setOptions({ title: route.params.title });
  return (
    <SafeAreaView style={styles.container}>
      <Graph data={route.params.data} fullScreen={true}>
        {route.params.includeArrows && (
          <VictoryScatter dataComponent={<ArrowPoint fullScreen={true} />} />
        )}
      </Graph>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: white,
    justifyContent: 'center',
  },
});

export default FullScreenGraph;

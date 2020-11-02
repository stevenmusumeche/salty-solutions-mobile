import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import {
  SafeAreaView,
  useSafeArea,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { VictoryScatter } from 'victory-native';
import { white } from '../colors';
import { NowStackParams } from '../screens/NowScreen';
import Graph from './Graph';
import { ArrowPoint } from './WindCard';
import { lockAsync, OrientationLock } from 'expo-screen-orientation';
import { View } from 'react-native';

interface Props {
  route: RouteProp<NowStackParams, 'FullScreenGraph'>;
  navigation: StackNavigationProp<NowStackParams, 'FullScreenGraph'>;
}

const FullScreenGraph: React.FC<Props> = ({ route, navigation }) => {
  const safeArea = useSafeArea();
  const window = useWindowDimensions();
  console.log(safeArea);

  // async function changeScreenOrientation() {
  //   await lockAsync(OrientationLock.LANDSCAPE_LEFT);
  // }
  // //useEffect(() => {
  // changeScreenOrientation();
  // //}, []);
  // // navigation.setOptions({ title: route.params.title });
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.graphWrapper}>
        <Graph data={route.params.data} fullScreen={true}>
          {route.params.includeArrows && (
            <VictoryScatter dataComponent={<ArrowPoint fullScreen={true} />} />
          )}
        </Graph>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: white,
  },
  graphWrapper: {
    // paddingHorizontal: 10,
    // paddingVertical: 50,
    //transform: [{ rotate: '90deg' }],
    flex: 1,
    flexGrow: 1,
    // justifyContent: 'center',
    // alignItems: 'flex-start',
  },
});

export default FullScreenGraph;

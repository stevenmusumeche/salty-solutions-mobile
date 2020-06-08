import React from 'react';
import { StyleSheet, View } from 'react-native';
import Unknown from './svg/water-conditions/Unknown';
import Choppy from './svg/water-conditions/Choppy';
import LightChop from './svg/water-conditions/LightChop';
import Rough from './svg/water-conditions/Rough';
import Smooth from './svg/water-conditions/Smooth';

interface Props {
  min: number;
  max: number;
}

const WaterConditionIcon: React.FC<Props> = ({ max }) => {
  let image = (
    <Unknown
      width={100}
      height={50}
      transform={[{ scale: 0.65 }]}
      style={{ marginTop: -3 }}
    />
  );

  if (max === -Infinity) {
    image = image;
  } else if (max <= 6) {
    image = (
      <Smooth
        width={100}
        height={40}
        transform={[{ scale: 0.8 }]}
        style={{ marginTop: 7 }}
      />
    );
  } else if (max <= 12) {
    image = (
      <LightChop
        width="300"
        height="120"
        transform={[{ scale: 0.22 }]}
        style={{ marginTop: -37 }}
      />
    );
  } else if (max <= 18) {
    image = (
      <Choppy
        width="300"
        height="135"
        transform={[{ scale: 0.23 }]}
        style={{ marginTop: -43 }}
      />
    );
  } else if (max > 18) {
    image = (
      <Rough
        width="300"
        height="138"
        transform={[{ scale: 0.24 }]}
        style={{ marginTop: -45 }}
      />
    );
  }

  return <View style={styles.container}>{image}</View>;
};

export default WaterConditionIcon;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: 40,
  },
});

import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import Unknown from './svg/water-conditions/Unknown';
import Choppy from './svg/water-conditions/Choppy';
import LightChop from './svg/water-conditions/LightChop';
import Rough from './svg/water-conditions/Rough';
import Smooth from './svg/water-conditions/Smooth';

interface Props {
  text?: string;
}

const WaterConditionIcon: React.FC<Props> = ({ text = '' }) => {
  let image = <Unknown width={100} height={50} transform={[{ scale: 1.3 }]} />;
  let margin = 5;

  const [, second] = text.split('-');

  switch (text) {
    case 'smooth':
    case '0-1':
      image = (
        <Smooth
          width={100}
          height={40}
          transform={[{ scale: 1.2 }]}
          style={{ marginTop: 5 }}
        />
      );
      break;
    case 'light chop':
    case 'moderate chop':
    case '0-2':
    case '1-2':
      image = (
        <LightChop
          width="300"
          height="120"
          transform={[{ scale: 0.4 }]}
          style={{ marginTop: -30 }}
        />
      );
      margin = -29;
      break;
    case 'choppy':
    case '2-3':
    case '2-4':
      image = (
        <Choppy
          width="150"
          height="120"
          transform={[{ scale: 1.3 }]}
          style={{ marginTop: -15 }}
        />
      );
      margin = -43;
      break;
    case 'rough':
    case 'very rough':
      image = (
        <Rough
          width="300"
          height="138"
          transform={[{ scale: 0.45 }]}
          style={{ marginTop: -45 }}
        />
      );
      margin = -36;
      break;
    default:
      if (text.startsWith('smooth')) {
        image = (
          <Smooth
            width={100}
            height={40}
            transform={[{ scale: 1.2 }]}
            style={{ marginTop: 5 }}
          />
        );
      }
      if (text.startsWith('light chop')) {
        image = (
          <LightChop
            width="300"
            height="120"
            transform={[{ scale: 0.4 }]}
            style={{ marginTop: -30 }}
          />
        );
        margin = -29;
      }
      if (text.startsWith('moderate chop')) {
        image = (
          <LightChop
            width="300"
            height="120"
            transform={[{ scale: 0.4 }]}
            style={{ marginTop: -30 }}
          />
        );
        margin = -29;
      }
      if (
        text.startsWith('rough') ||
        (Number(second) >= 3 && Number(second) < 6)
      ) {
        image = (
          <Rough
            width="300"
            height="138"
            transform={[{ scale: 0.45 }]}
            style={{ marginTop: -45 }}
          />
        );
        margin = -36;
      }
      if (text.startsWith('very rough') || Number(second) >= 6) {
        image = (
          <Rough
            width="300"
            height="138"
            transform={[{ scale: 0.45 }]}
            style={{ marginTop: -45 }}
          />
        );
        margin = -36;
      }
      break;
  }

  return (
    <View style={styles.container}>
      {image}
      <Text style={[styles.waterText, { marginTop: margin }]}>
        {text || 'unknown'}
      </Text>
    </View>
  );
};

export default WaterConditionIcon;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  waterText: {
    fontSize: 10.5,
    color: '#2d3748',
  },
});

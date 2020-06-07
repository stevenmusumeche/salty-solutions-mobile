import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Maybe,
  ForecastDescription,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';

interface Props {
  day?: Maybe<ForecastDescription>;
  night?: Maybe<ForecastDescription>;
}

const ForecastText: React.FC<Props> = (props) => {
  return (
    <View style={styles.container}>
      <Text>text</Text>
    </View>
  );
};

export default ForecastText;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
});

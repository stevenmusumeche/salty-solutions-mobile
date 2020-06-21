import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Maybe,
  ForecastDescription,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { gray, blue } from '../colors';

interface Props {
  day?: Maybe<ForecastDescription>;
  night?: Maybe<ForecastDescription>;
}

const ForecastText: React.FC<Props> = ({ day, night }) => {
  const hasAny =
    !!day?.marine || !!night?.marine || !!day?.detailed || !!night?.detailed;

  if (!hasAny) {
    return null;
  }

  return (
    <View style={styles.container}>
      {(day?.marine || night?.marine) && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Marine Forecast</Text>
          <Text style={styles.sectionContent}>
            {day?.marine || night?.marine}
          </Text>
        </View>
      )}

      {day?.detailed && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Daytime Forecast</Text>
          <Text style={styles.sectionContent}>{day.detailed}</Text>
        </View>
      )}

      {night?.detailed && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Nighttime Forecast</Text>
          <Text style={styles.sectionContent}>{night.detailed}</Text>
        </View>
      )}
    </View>
  );
};

export default ForecastText;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    marginTop: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionHeader: {
    color: gray[600],
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 5,
  },
  sectionContent: {
    color: gray[700],
  },
  toggleButton: {
    color: blue[600],
  },
});

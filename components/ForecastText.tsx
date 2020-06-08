import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import {
  Maybe,
  ForecastDescription,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';

interface Props {
  day?: Maybe<ForecastDescription>;
  night?: Maybe<ForecastDescription>;
}

const ForecastText: React.FC<Props> = ({ day, night }) => {
  const [collapsed, setCollapsed] = useState(true);
  const hasAny =
    !!day?.marine || !!night?.marine || !!day?.detailed || !!night?.detailed;
  const previewText =
    day?.marine || night?.marine || day?.detailed || night?.detailed;

  if (!hasAny) {
    return null;
  }

  if (collapsed) {
    return (
      <View style={styles.container}>
        <View style={styles.section}>
          <Text numberOfLines={3} style={styles.sectionContent}>
            {previewText}
          </Text>
        </View>
        <Button
          onPress={() => setCollapsed(false)}
          title="Read More"
          color="#3182ce"
        />
      </View>
    );
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
      <View>
        <Button
          onPress={() => setCollapsed(true)}
          title="Show Less"
          color="#3182ce"
        />
      </View>
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
    color: '#718096',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 5,
  },
  sectionContent: {
    color: '#4a5568',
  },
  toggleButton: {
    color: '#3182ce',
  },
});

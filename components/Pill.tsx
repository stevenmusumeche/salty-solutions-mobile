import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Pill: React.FC<{ label: string; color?: string }> = ({
  label,
  children,
  color = '#3182ce',
}) => {
  return (
    <View
      style={[styles.container, { borderColor: color, backgroundColor: color }]}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={styles.value}>
        <Text style={styles.valueText}>{children}</Text>
      </View>
    </View>
  );
};

export default Pill;

const styles = StyleSheet.create({
  container: {
    width: '49%',
    flexDirection: 'row',
    marginBottom: 5,
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
    alignItems: 'stretch',
  },
  label: {
    width: '50%',
    textAlign: 'center',
    color: 'white',
    paddingVertical: 5,
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '500',
  },
  value: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  valueText: {
    fontSize: 14,
  },
});

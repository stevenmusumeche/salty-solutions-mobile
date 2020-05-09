import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface Props {
  message?: string;
}

const FullScreenError: React.FC<Props> = ({
  message = 'Oh no! An error has occurred.',
}) => (
  <View style={styles.container}>
    <View style={{ marginBottom: 5 }}>
      <ErrorIcon />
    </View>
    <Text>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

export default FullScreenError;

export const ErrorIcon: React.FC<any> = (props) => (
  <FontAwesome name="warning" size={60} color="#C68E37" {...props} />
);

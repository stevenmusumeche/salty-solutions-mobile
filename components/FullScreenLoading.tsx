import React from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
  ActivityIndicator,
  Text,
} from 'react-native';
import { gray, white } from '../colors';

type Props = {
  route: { params: { error?: string } };
};

const FullScreenLoading: React.FC<Props> = ({ route }) => {
  const { width } = useWindowDimensions();
  const error = route?.params?.error;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.containerContent}
    >
      <View>
        <Image
          source={require('../assets/logo.png')}
          style={{ width, height: width / 5.21 }}
          resizeMode="stretch"
        />
        <View style={styles.spinnerWrapper}>
          {error ? (
            <Text style={{ color: white }}>Error: {error}</Text>
          ) : (
            <ActivityIndicator color={white} />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default FullScreenLoading;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gray['700'],
    flexGrow: 1,
  },
  containerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    color: white,
    flex: 1,
    marginHorizontal: 'auto',
  },
  spinnerWrapper: {
    marginTop: 30,
    alignItems: 'center',
  },
});

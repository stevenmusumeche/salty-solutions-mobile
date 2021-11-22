import React from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { gray, white } from '../colors';
import { useUserContext } from '../context/UserContext';

const LoginScreen = () => {
  const { width } = useWindowDimensions();
  const { actions } = useUserContext();

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
        <View style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.button} onPress={actions.login}>
            <Text style={styles.buttonText}>Login To Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;

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
  buttonWrapper: {
    marginTop: 30,
    alignItems: 'center',
  },
  button: {
    backgroundColor: gray['900'],
    paddingVertical: 15,
    paddingHorizontal: 45,
    borderRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: white,
    textAlign: 'center',
    fontSize: 18,
  },
});

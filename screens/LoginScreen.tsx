import React from 'react';
import {
  Button,
  Text,
  View,
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { gray, white, yellow } from '../colors';
import { useUserContext } from '../context/UserContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const { width } = useWindowDimensions();
  const { actions } = useUserContext();
  const navigation = useNavigation<StackNavigationProp<any>>();

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <Image
          source={require('../assets/logo.png')}
          style={{ width, height: width / 5.21 }}
          resizeMode="stretch"
        />
        <View style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.button} onPress={actions.login}>
            <Text style={styles.buttonText}>Login To Continue</Text>
          </TouchableOpacity>
          <View style={styles.copyWrapper}>
            <Text style={styles.copyText}>
              Salty Solution uses Auth0 to manage your login information. We
              will never share or abuse your personal information. Ever.
            </Text>
          </View>
        </View>
      </View>
      <View>
        <Button
          color={gray[500]}
          onPress={() => navigation.push('Contact')}
          title="Need Help?"
        />
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: gray['700'],
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    color: white,
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
  copyWrapper: {
    marginTop: 30,
    paddingHorizontal: 45,
  },
  copyText: {
    color: gray[200],
  },
});

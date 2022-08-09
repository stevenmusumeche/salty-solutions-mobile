import React from 'react';
import VersionCheck from 'react-native-version-check';
import {
  Text,
  View,
  StyleSheet,
  Button,
  Linking,
  Image,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { white, gray, red } from '../colors';
import { useUserContext } from '../context/UserContext';
import { FontAwesome } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

interface Props {}

const SettingsScreen: React.FC<Props> = ({}) => {
  const { actions, user } = useUserContext();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<StackNavigationProp<any>>();

  return (
    <ScrollView style={styles.container}>
      <View style={{ padding: 20 }}>
        <Text style={styles.header}>Your Account</Text>
        {!user.isLoggedIn ? (
          <View>
            <Paragraph>
              Click the "Login" button below to access all features of Salty
              Solutions.
            </Paragraph>
            <Button onPress={actions.login} title="Login to Salty Solutions" />
          </View>
        ) : (
          <View>
            <Paragraph>You're logged in as {user.name}!</Paragraph>
            <Button
              onPress={actions.logout}
              color={red[700]}
              title="Logout from Salty Solutions"
            />
          </View>
        )}
      </View>
      <View
        style={{
          padding: 20,
          backgroundColor: gray[100],
          borderColor: gray[200],
          borderTopWidth: 1,
        }}
      >
        <Text style={styles.header}>Contact Me</Text>
        <Paragraph>
          If you need help or would like to get in touch, please click the
          button below. You can also email me at steven@musumeche.com.
        </Paragraph>
        <Button onPress={() => navigation.push('Contact')} title="Contact Me" />
      </View>
      <View
        style={{
          padding: 20,
          backgroundColor: gray[100],
          borderColor: gray[200],
          borderTopWidth: 1,
          borderBottomWidth: 1,
        }}
      >
        <Text style={styles.header}>About</Text>
        <Paragraph>
          Hi, I'm Steven Musumeche, a resident of Lafayette, LA and avid
          saltwater fisherman. I created Salty Solutions to answer a question
          that I'm always asking myself:
        </Paragraph>
        <Text style={[styles.when, styles.paragraph]}>
          WHEN SHOULD I GO FISHING?
        </Text>
        <Paragraph>
          Like most of you, I have a limited amount of time that I can devote to
          fishing. When I plan my next fishing trip, I want to make sure the
          conditions are conducive to a productive day on the water.
        </Paragraph>
        <Paragraph>
          There are lots of great websites and apps available with information
          about weather, tides, and more. However, none of them gave me
          everything that I wanted to know in a way that could be quickly viewed
          and easily digested.
        </Paragraph>
        <Paragraph>
          I'm a software engineer by trade, so I thought, "hey, I can make
          something decent enough for personal use." After showing it to a few
          fellow fisherman, I decided to release it publically for everyone to
          use.
        </Paragraph>
        <Paragraph>
          I hope you find it useful - please contact me with any suggestions or
          comments.
        </Paragraph>
        <Text style={{ color: gray[400], textAlign: 'center' }}>
          App: {VersionCheck.getCurrentVersion()}, Build:{' '}
          {VersionCheck.getCurrentBuildNumber()}, Code: 2.0.3
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 20,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              `mailto:steven@musumeche.com?subject=Salty Solutions ${
                Platform.OS === 'ios' ? 'iOS' : 'Android'
              } App`,
            ).catch()
          }
        >
          <MaterialIcons name="email" size={48} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://www.facebook.com/musumeche')}
        >
          <FontAwesome name="facebook-square" size={48} color="#3b5998" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://twitter.com/smusumeche')}
        >
          <FontAwesome name="twitter" size={48} color="#1DA1F2" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL('https://www.linkedin.com/in/smusumeche')
          }
        >
          <FontAwesome name="linkedin-square" size={48} color="#0e76a8" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://github.com/stevenmusumeche')}
        >
          <FontAwesome name="github" size={48} color="#333333" />
        </TouchableOpacity>
      </View>
      <View>
        <Image
          source={require('../assets/steven.jpg')}
          style={{ width, height: width / 1.333 }}
          resizeMode="stretch"
        />
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;

const Paragraph: React.FC = ({ children }) => (
  <Text style={styles.paragraph}>{children}</Text>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: white,
    flexGrow: 1,
  },
  header: {
    fontSize: 24,
    marginBottom: 15,
  },

  when: {
    fontWeight: '500',
  },
  paragraph: {
    marginBottom: 15,
  },
});

import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Button,
  Linking,
} from 'react-native';
import { black, gray, red, white } from '../colors';
import { VersionInfo } from '../context/AppVersionContext';

const ForceUpgrade: React.FC<{ versionInfo: VersionInfo }> = ({
  versionInfo,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.titleWrapper}>
          <FontAwesome name="warning" size={32} color={red[700]} />
          <Text style={styles.updateRequired}>Update Required</Text>
        </View>
        <Text style={styles.warningText}>
          In order to continue using Salty Solutions, you must install the
          latest version from the app store.
        </Text>
        <View style={styles.detailTextWrapper}>
          <Text style={styles.detailText}>
            Your Version: {versionInfo.buildVersion}
          </Text>
          <Text style={styles.detailText}>
            Minimum Supported Version: {versionInfo.minimum}
          </Text>
          <Text style={styles.detailText}>
            Current Version: {versionInfo.current}
          </Text>
        </View>
        <Button
          onPress={() => Linking.openURL(versionInfo.upgradeUrl)}
          title="Upgrade"
        />
      </View>
    </SafeAreaView>
  );
};

export default ForceUpgrade;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: white,
    justifyContent: 'center',
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    alignItems: 'center',
    padding: 10,
  },
  updateRequired: {
    color: black,
    marginTop: 5,
    fontSize: 35,
    marginLeft: 10,
    paddingBottom: 8,
  },
  warningText: {
    fontSize: 16,
    marginVertical: 10,
  },
  detailTextWrapper: {
    marginVertical: 30,
  },
  detailText: {
    color: gray[600],
  },
});

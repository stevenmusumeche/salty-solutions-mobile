import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Linking } from 'react-native';
import { black, brandYellow } from '../colors';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { useAppVersionContext } from '../context/AppVersionContext';

const UpgradeNotice = () => {
  const { upgradeUrl } = useAppVersionContext();

  const handleUpdate = useCallback(async () => {
    Linking.openURL(upgradeUrl);
  }, [upgradeUrl]);

  return (
    <TouchableHighlight onPress={handleUpdate}>
      <View style={styles.container}>
        <Text style={styles.text}>
          A new version of Salty Solutions is available. Click here to upgrade.
        </Text>
      </View>
    </TouchableHighlight>
  );
};

export default UpgradeNotice;

const styles = StyleSheet.create({
  container: {
    backgroundColor: brandYellow,
    padding: 8,
    alignItems: 'center',
    shadowColor: black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 3,
  },
  text: {
    fontSize: 11,
    color: black,
  },
});

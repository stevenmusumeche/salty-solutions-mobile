import { Octicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useLayoutEffect } from 'react';
import { brandYellow, white } from '../colors';
import { Feather } from '@expo/vector-icons';

export const useLocationSwitcher = () => {
  const navigation = useNavigation<StackNavigationProp<any>>();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRightContainerStyle: {
        paddingRight: 10,
      },
      headerLeftContainerStyle: {
        paddingLeft: 10,
      },
      headerRight: () => {
        return (
          <Octicons
            name="location"
            size={24}
            color={brandYellow}
            onPress={() => navigation.push('ChangeLocation')}
          />
        );
      },
      headerLeft: () => (
        <Feather
          name="menu"
          size={24}
          color={white}
          onPress={() => navigation.push('Settings')}
        />
      ),
    });
  }, [navigation]);
};

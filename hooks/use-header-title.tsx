import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useContext, useLayoutEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useWindowDimensions } from 'react-native';

export const useHeaderTitle = (title: string) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { activeLocation } = useContext(AppContext);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title + ' for ' + activeLocation.name,
      headerTitleStyle: { width: width - 70 },
    });
  }, [activeLocation, navigation, title, width]);
};

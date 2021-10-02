import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useContext, useLayoutEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useWindowDimensions, Platform } from 'react-native';

export const useHeaderTitle = (
  title: string,
  withLocation = true,
  fontSize = 17,
) => {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { activeLocation } = useContext(AppContext);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: withLocation ? title + ' for ' + activeLocation.name : title,
      headerTitleStyle: {
        // width: width - 70,
        textAlign: Platform.OS === 'ios' ? 'center' : 'left',
        fontSize,
      },
      headerStyle: {
        shadowColor: 'transparent',
      },
    });
  }, [activeLocation, fontSize, navigation, title, width, withLocation]);
};

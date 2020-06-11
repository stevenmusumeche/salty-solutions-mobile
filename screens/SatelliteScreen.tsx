import { AntDesign } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import {
  ModisMap,
  useModisMapQuery,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { format } from 'date-fns';
import { differenceInDays } from 'date-fns/esm';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import LoaderBlock from '../components/LoaderBlock';
import { AppContext } from '../context/AppContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type StackParams = {
  'Satellite Image Detail': {
    image: Pick<ModisMap, 'date' | 'large'>;
  };
  'Satellite Imagery': undefined;
};

const NowStack = createStackNavigator<StackParams>();

type SatelliteNavigationProp = StackNavigationProp<
  StackParams,
  'Satellite Imagery'
>;

type Props = {
  navigation: SatelliteNavigationProp;
};

const Satellite: React.FC<Props> = ({ navigation }) => {
  useLocationSwitcher();
  useHeaderTitle('Satellite Imagery');
  const scrollRef = useRef<any>(null);
  const { width } = useWindowDimensions();
  const { activeLocation } = useContext(AppContext);
  const [modisMap] = useModisMapQuery({
    variables: { locationId: activeLocation.id },
  });
  const [curIndex, setCurIndex] = useState(0);

  const handleSmallMapPress = () => {
    navigation.push('Satellite Image Detail', { image: curImage });
  };

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current !== null) {
        scrollRef.current.scrollToEnd({ animated: false });
      }
    }, 10);
    if (modisMap.data && modisMap.data.location) {
      setCurIndex(modisMap.data.location.modisMaps.length - 1);
    }
  }, [modisMap.data]);

  if (modisMap.fetching || !modisMap.data || !modisMap.data.location) {
    return (
      <View style={styles.container}>
        <LoaderBlock styles={{ ...styles.loaderBlock, height: 70 }} />
        <LoaderBlock styles={{ ...styles.loaderBlock, height: 50 }} />
        <LoaderBlock styles={{ ...styles.loaderBlock, height: 400 }} />
        <LoaderBlock styles={{ ...styles.loaderBlock, height: 70 }} />
      </View>
    );
  }

  const maps = [...modisMap.data.location.modisMaps].reverse();
  const curImage = maps[curIndex];
  const curDate = new Date(curImage.date);
  const dayDiff = differenceInDays(new Date(), curDate);
  const pressText = Platform.OS === 'android' ? 'Long press' : 'Press';
  const touchableProps = {
    [Platform.OS === 'ios' ? 'onPress' : 'onLongPress']: handleSmallMapPress,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.introText}>
        MODIS is an extensive program with two satellites (Aqua and Terra) that
        pass over the United States and take a giant photo each day. Most
        importantly for fishermen,{' '}
        <Text style={styles.bold}>
          you can use the imagery to find clean water.
        </Text>
      </Text>

      <View style={styles.tileHeader}>
        <View>
          <MaterialCommunityIcons
            name="gesture-swipe-right"
            size={20}
            color={curIndex > 0 ? 'rgba(0,0,0,.5)' : 'transparent'}
          />
        </View>
        <View>
          <Text style={styles.tileText}>{format(curDate, 'EEEE, LLLL d')}</Text>
          <Text style={styles.tileDiffText}>
            {dayDiff === 0
              ? 'Today '
              : `${dayDiff} day${dayDiff > 1 ? 's' : ''} ago `}
            ({curImage.satellite.toLowerCase()} satellite)
          </Text>
        </View>
        <View>
          <MaterialCommunityIcons
            name="gesture-swipe-left"
            size={20}
            color={
              curIndex < maps.length - 1 ? 'rgba(0,0,0,.5)' : 'transparent'
            }
          />
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal={true}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.floor(
            e.nativeEvent.contentOffset.x / (width - 60),
          );
          setCurIndex(newIndex);
        }}
        style={styles.swiperView}
      >
        {maps.map((map, i) => {
          const smallImageDisplayWidth = width - 40;
          const smallImageDisplayHeight =
            (map.small.height * smallImageDisplayWidth) / map.small.width;

          return (
            <View key={i}>
              <TouchableWithoutFeedback {...touchableProps}>
                <Image
                  source={{
                    uri: map.small.url,
                    width: smallImageDisplayWidth,
                    height: smallImageDisplayHeight,
                  }}
                />
              </TouchableWithoutFeedback>
            </View>
          );
        })}
      </ScrollView>

      <Text style={styles.zoomText}>
        {pressText} image to open zoomable view.
      </Text>
      <Text>
        Swipe left and right to view different days, and{' '}
        {pressText.toLowerCase()} any image to open a zoomable view.
      </Text>
    </View>
  );
};

interface ImageScreenProps {
  route: RouteProp<StackParams, 'Satellite Image Detail'>;
}

const ImageDetailScreen: React.FC<ImageScreenProps> = ({ route }) => {
  return (
    <WebView
      source={{ uri: route.params.image.large.url }}
      startInLoadingState={true}
      renderLoading={() => (
        <View style={styles.webviewLoading}>
          <ActivityIndicator size="large" />
        </View>
      )}
    />
  );
};

const SatelliteScreen = () => (
  <NowStack.Navigator>
    <NowStack.Screen name="Satellite Imagery" component={Satellite} />
    <NowStack.Screen
      name="Satellite Image Detail"
      component={ImageDetailScreen}
      options={({ route }) => {
        const title = format(new Date(route.params.image.date), 'EEEE, LLLL d');
        return {
          title,
          headerTitleStyle: { color: 'white' },
          headerTintColor: '#fec857',
        };
      }}
    />
  </NowStack.Navigator>
);

export default SatelliteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
  introText: {
    marginBottom: 20,
  },
  tileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tileText: {
    textAlign: 'center',
    fontSize: 20,
  },
  tileDiffText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  loaderBlock: {
    backgroundColor: '#cbd5e0',
    width: '100%',
    marginBottom: 20,
  },
  zoomText: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    color: '#606F7B',
  },
  webviewLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  swiperView: { flexGrow: 0 },
  bold: { fontWeight: 'bold' },
});

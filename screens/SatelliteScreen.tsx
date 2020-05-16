import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { useModisMapQuery } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { format } from 'date-fns';
import { differenceInDays } from 'date-fns/esm';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import ImageViewer from 'react-native-image-zoom-viewer';
import LoaderBlock from '../components/LoaderBlock';
import { AppContext } from '../context/AppContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';

const NowStack = createStackNavigator();

const Satellite: React.FC = () => {
  useLocationSwitcher();
  useHeaderTitle('Satellite Imagery');
  const scrollRef = useRef<any>(null);
  const { width } = useWindowDimensions();
  const [showModal, setShowModal] = useState(false);

  const { activeLocation } = useContext(AppContext);
  const [modisMap] = useModisMapQuery({
    variables: { locationId: activeLocation.id },
  });
  const [curIndex, setCurIndex] = useState(0);

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
        <LoaderBlock styles={{ ...styles.loaderBlock, height: 90 }} />
        <LoaderBlock styles={{ ...styles.loaderBlock, height: 50 }} />
        <LoaderBlock styles={{ ...styles.loaderBlock, height: 400 }} />
      </View>
    );
  }

  const maps = [...modisMap.data.location.modisMaps].reverse();
  const curImage = maps[curIndex];

  return (
    <View style={styles.container}>
      <Text style={styles.introText}>
        MODIS is an extensive program with two satellites (Aqua and Terra) that
        pass over the United States and take a giant photo each day. Most
        importantly for fishermen,{' '}
        <Text style={{ fontWeight: 'bold' }}>
          you can use the imagery to find clean water.
        </Text>
      </Text>

      <ScrollView
        ref={scrollRef}
        horizontal={true}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.floor(
            e.nativeEvent.contentOffset.x / (width - 40),
          );
          setCurIndex(newIndex);
        }}
      >
        {maps.map((map, i) => {
          const smallImageDisplayWidth = width - 40;
          const smallImageDisplayHeight =
            (map.small.height * smallImageDisplayWidth) / map.small.width;
          const date = new Date(map.date);
          const dayDiff = differenceInDays(new Date(), date);

          return (
            <View key={i}>
              <View style={styles.tileHeader}>
                <View>
                  <AntDesign
                    name="left"
                    size={24}
                    color={i > 0 ? 'black' : 'transparent'}
                  />
                </View>
                <View>
                  <Text style={styles.tileText}>
                    {format(date, 'EEEE, LLLL d')}
                  </Text>
                  <Text style={styles.tileDiffText}>
                    {dayDiff === 0
                      ? 'Today '
                      : `${dayDiff} day${dayDiff > 1 ? 's' : ''} ago `}
                    ({map.satellite.toLowerCase()} satellite)
                  </Text>
                </View>
                <View>
                  <AntDesign
                    name="right"
                    size={24}
                    color={i < maps.length - 1 ? 'black' : 'transparent'}
                  />
                </View>
              </View>
              <TouchableHighlight onPress={() => setShowModal(true)}>
                <Image
                  source={{
                    uri: map.small.url,
                    width: smallImageDisplayWidth,
                    height: smallImageDisplayHeight,
                  }}
                />
              </TouchableHighlight>
            </View>
          );
        })}
      </ScrollView>

      <Text style={styles.zoomText}>Press image to open zoomable view.</Text>
      <Text>
        Swipe left and right to view different days, and press any image to open
        a zoomable view.
      </Text>

      <Modal
        visible={showModal}
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <ImageViewer
          maxScale={20}
          // @ts-ignore
          renderIndicator={() => null}
          renderHeader={() => (
            <View style={styles.modalHeader}>
              <MaterialIcons
                name="close"
                size={24}
                color="white"
                onPress={() => setShowModal(false)}
              />
            </View>
          )}
          imageUrls={[
            {
              url: curImage.large.url,
              width: curImage.large.width,
              height: curImage.large.height,
            },
          ]}
          enableSwipeDown={true}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </View>
  );
};

const SatelliteScreen = () => (
  <NowStack.Navigator>
    <NowStack.Screen name="Satellite Imagery" component={Satellite} />
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
  modalHeader: {
    color: 'white',
    position: 'absolute',
    zIndex: 1,
    top: 60,
    right: 10,
    width: '100%',
    alignItems: 'flex-end',
  },
  loaderBlock: {
    backgroundColor: '#cbd5e0',
    width: '100%',
    marginBottom: 20,
  },
  zoomText: {
    textAlign: 'center',
    marginVertical: 10,
    color: '#606F7B',
  },
});

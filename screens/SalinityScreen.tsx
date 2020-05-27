import { createStackNavigator } from '@react-navigation/stack';
import { useSalinityMapQuery } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import React, { useCallback, useContext, useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import FitImage from 'react-native-fit-image';
import WebView from 'react-native-webview';
import FullScreenError from '../components/FullScreenError';
import LoaderBlock from '../components/LoaderBlock';
import { AppContext } from '../context/AppContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';

const ForecastStack = createStackNavigator();

const Salinity: React.FC = () => {
  useLocationSwitcher();
  useHeaderTitle('Salinity Map');
  const { width } = useWindowDimensions();

  const [refreshing, setRefreshing] = React.useState(false);
  const { activeLocation } = useContext(AppContext);
  const [salinityMap, refresh] = useSalinityMapQuery({
    variables: { locationId: activeLocation.id },
    pause: !activeLocation,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refresh({ requestPolicy: 'network-only' });
  }, [refresh]);

  useEffect(() => {
    if (refreshing && !salinityMap.fetching) {
      setRefreshing(false);
    }
  }, [refreshing, salinityMap.fetching]);

  if (salinityMap.error) {
    return (
      <View>
        <Text>error</Text>
      </View>
    );
  }

  let stuffToRender;
  if (salinityMap.fetching) {
    stuffToRender = (
      <LoaderBlock styles={{ ...styles.loaderBlock, height: 300 }} />
    );
  } else if (salinityMap.error) {
    stuffToRender = <FullScreenError />;
  } else {
    const mapUrl = salinityMap.data?.location?.salinityMap ?? '';
    const isPdf = /saveourlake/.test(mapUrl);

    let mapToRender;
    if (isPdf) {
      // actual size is 792 × 612
      const pdfWidth = width - 40;
      const pdfHeight = 612 * (pdfWidth / 792);
      mapToRender = (
        <WebView
          source={{ uri: mapUrl }}
          startInLoadingState={true}
          style={{ width: pdfWidth, height: pdfHeight, backgroundColor: 'red' }}
        />
      );
    } else {
      mapToRender = <FitImage source={{ uri: mapUrl }} />;
    }

    stuffToRender = (
      <View>
        {mapToRender}
        {/* todo: make touching to zoom work */}
        <Text style={styles.zoomText}>Press image to open zoomable view.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {stuffToRender}
      </ScrollView>
    </View>
  );
};

const SalinityScreen = () => (
  <ForecastStack.Navigator>
    <ForecastStack.Screen name="Salinity" component={Salinity} />
  </ForecastStack.Navigator>
);

export default SalinityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    marginBottom: 0,
  },
  loadingContainer: {
    padding: 10,
  },
  loadingWrapper: {
    padding: 10,
    backgroundColor: 'white',
    flexGrow: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 3,
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
});

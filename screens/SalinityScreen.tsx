import {
  createStackNavigator,
  StackNavigationProp,
} from '@react-navigation/stack';
import { useSalinityMapQuery } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import React, { useCallback, useContext, useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  TouchableWithoutFeedback,
} from 'react-native';
import WebView from 'react-native-webview';
import FullScreenError from '../components/FullScreenError';
import LoaderBlock from '../components/LoaderBlock';
import { AppContext } from '../context/AppContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';
import RemoteImage from '../components/RemoteImage';
import { RouteProp } from '@react-navigation/native';
import { brandYellow, black, gray, white } from '../colors';
import UpgradeNotice from '../components/UpgradeNotice';
import { useAppVersionContext } from '../context/AppVersionContext';
import { useUserContext } from '../context/UserContext';
import Teaser from '../components/Teaser';

type StackParams = {
  'Zoomable Salinity Map': {
    image: string;
  };
  SalinityStack: undefined;
};

const SalinityStack = createStackNavigator<StackParams>();

type SalinityNavigationProp = StackNavigationProp<StackParams, 'SalinityStack'>;

type Props = {
  navigation: SalinityNavigationProp;
};

const Salinity: React.FC<Props> = ({ navigation }) => {
  useLocationSwitcher();
  useHeaderTitle('Salinity Map');
  const { user } = useUserContext();

  const { width } = useWindowDimensions();

  const [refreshing, setRefreshing] = React.useState(false);
  const { activeLocation } = useContext(AppContext);
  const { newVersionAvailable } = useAppVersionContext();
  const [salinityMap, refresh] = useSalinityMapQuery({
    variables: { locationId: activeLocation.id },
    pause: !user.entitledToPremium,
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

  if (!user.entitledToPremium) {
    return (
      <Teaser
        title="Find water with ideal salinity"
        description="Improve your fishing trips by focusing on areas with ideal salinity. When targeting speckled trout or redfish, part of the equation is the presence of salty water."
        buttonSubtitle="Login for free to access salinity maps."
      />
    );
  }

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
    stuffToRender = (
      <View>
        <TouchableWithoutFeedback
          onPress={() =>
            navigation.push('Zoomable Salinity Map', { image: mapUrl })
          }
        >
          <View>
            <RemoteImage imageUrl={mapUrl} desiredWidth={width - 40} />
          </View>
        </TouchableWithoutFeedback>
        <Text style={styles.zoomText}>Press image to open zoomable view.</Text>
      </View>
    );
  }

  return (
    <>
      {newVersionAvailable && <UpgradeNotice />}
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
    </>
  );
};

interface ImageScreenProps {
  route: RouteProp<StackParams, 'Zoomable Salinity Map'>;
}

const ImageDetailScreen: React.FC<ImageScreenProps> = ({ route }) => {
  return (
    <WebView
      source={{
        html: `<body><img style="width:100%;" src="${route.params.image}" /></body>`,
      }}
      startInLoadingState={true}
    />
  );
};

const SalinityScreen = () => (
  <SalinityStack.Navigator>
    <SalinityStack.Screen name="SalinityStack" component={Salinity} />
    <SalinityStack.Screen
      name="Zoomable Salinity Map"
      component={ImageDetailScreen}
      options={() => {
        return {
          headerTitleStyle: { color: white },
          headerTintColor: brandYellow,
        };
      }}
    />
  </SalinityStack.Navigator>
);

export default SalinityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginBottom: 0,
  },
  loadingContainer: {
    padding: 10,
  },
  loadingWrapper: {
    padding: 10,
    backgroundColor: white,
    flexGrow: 1,
    borderRadius: 8,
    shadowColor: black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 3,
  },
  loaderBlock: {
    backgroundColor: gray[400],
    width: '100%',
    marginBottom: 20,
  },
  zoomText: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    color: gray[700],
  },
  webviewLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
});

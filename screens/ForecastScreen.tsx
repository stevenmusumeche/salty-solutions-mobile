import { createStackNavigator } from '@react-navigation/stack';
import { useCombinedForecastQuery } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import React, { useContext } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import ForecastCard from '../components/ForecastCard';
import FullScreenError from '../components/FullScreenError';
import LoaderBlock from '../components/LoaderBlock';
import { AppContext } from '../context/AppContext';
import { useHeaderTitle } from '../hooks/use-header-title';
import { useLocationSwitcher } from '../hooks/use-location-switcher';

const ForecastStack = createStackNavigator();

const Forecast: React.FC = () => {
  useLocationSwitcher();
  useHeaderTitle('Forecast');

  const { activeLocation } = useContext(AppContext);

  const [forecast] = useCombinedForecastQuery({
    variables: { locationId: activeLocation.id },
    pause: !activeLocation,
  });
  const data =
    forecast.data &&
    forecast.data.location &&
    forecast.data.location.combinedForecast;

  if (forecast.fetching) {
    return (
      <View style={styles.container}>
        <ForecastLoaderCard />
        <ForecastLoaderCard />
        <ForecastLoaderCard />
        <ForecastLoaderCard />
        <ForecastLoaderCard />
        <ForecastLoaderCard />
      </View>
    );
  } else if (forecast.error && !data) {
    return <FullScreenError />;
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {data &&
          data.map((datum) => (
            <ForecastCard key={datum.timePeriod} datum={datum} />
          ))}
      </ScrollView>
    </View>
  );
};

const ForecastLoaderCard = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.loadingWrapper}>
      <LoaderBlock styles={{ width: '50%', height: 25, marginBottom: 15 }} />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 15,
          height: 90,
        }}
      >
        <LoaderBlock
          styles={{
            width: '25%',
            height: 'auto',
          }}
        />
        <LoaderBlock styles={{ width: '40%', height: 'auto' }} />
        <LoaderBlock styles={{ width: '30%', height: 'auto' }} />
      </View>

      <LoaderBlock styles={{ width: '100%', height: 50 }} />
    </View>
  </View>
);

const ForecastScreen = () => (
  <ForecastStack.Navigator>
    <ForecastStack.Screen name="Forecast" component={Forecast} />
  </ForecastStack.Navigator>
);

export default ForecastScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 10,
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
});

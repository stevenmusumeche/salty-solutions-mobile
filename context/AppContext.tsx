import {
  LocationDetailFragment,
  useLocationsQuery,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AsyncStorage } from 'react-native';
import Analytics from 'appcenter-analytics';

interface AppContext {
  locations: LocationDetailFragment[];
  activeLocation: LocationDetailFragment;
  actions: {
    setLocation: (location: LocationDetailFragment) => void;
  };
}

export const AppContext = createContext({} as AppContext);

export const AppContextProvider: React.FC = ({ children }) => {
  const [locations, setLocations] = useState<LocationDetailFragment[]>([]);
  const [activeLocation, setActiveLocation] = useState<LocationDetailFragment>(
    null as any,
  );
  const savedLocationKey = '@SaltySolutions:locationId';

  const setLocation = useCallback(async (location: LocationDetailFragment) => {
    setActiveLocation(location);
    await AsyncStorage.setItem(savedLocationKey, location.id).catch(() => {});
  }, []);

  const providerValue: AppContext = useMemo(
    () => ({
      locations,
      activeLocation,
      actions: {
        setLocation,
      },
    }),
    [locations, activeLocation, setLocation],
  );

  const [{ data }] = useLocationsQuery();

  useEffect(() => {
    if (!data) {
      return;
    }

    const setDefaultLocation = async () => {
      let defaultLocation;
      const savedLocationId = await AsyncStorage.getItem(
        savedLocationKey,
      ).catch();
      const match = data.locations.find(({ id }) => id === savedLocationId);
      if (match) {
        defaultLocation = match;
      } else {
        defaultLocation = data.locations[0];
      }

      setLocations(data.locations);
      setActiveLocation(defaultLocation);
    };

    setDefaultLocation();
  }, [data]);

  return (
    <AppContext.Provider value={providerValue}>{children}</AppContext.Provider>
  );
};

export const trackEvent = (
  eventName: string,
  properties: { [name: string]: string } = {},
): Promise<void> => {
  if (__DEV__) {
    console.debug('Tracking Event', eventName, properties);
    // don't actually track in dev
    // return;
  }
  try {
    return Analytics.trackEvent(eventName, properties);
  } catch (e) {
    console.error('Error tracking analytics event', e);
    return Promise.resolve();
  }
};

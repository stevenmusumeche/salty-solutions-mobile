// const [{ data, fetching, error }] = useLocationsQuery();
// console.log({ data, fetching, error });

import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  LocationDetailFragment,
  useLocationsQuery,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { AsyncStorage } from 'react-native';

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

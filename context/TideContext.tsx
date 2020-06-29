import {
  TideStationDetailFragment,
  UsgsParam,
  NoaaParam,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { startOfDay } from 'date-fns';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppContext } from './AppContext';
import { DataSite } from '../screens/NowScreen';

interface TideContext {
  date: Date;
  selectedTideStation?: TideStationDetailFragment;
  tideStations: TideStationDetailFragment[];
  sites: DataSite[];
  selectedSite?: DataSite;
  actions: {
    setDate: (date: Date) => void;
    setSelectedTideStationId: (id: string) => void;
    setSelectedSite: (site: DataSite) => void;
  };
}

export const TideContext = createContext({} as TideContext);

export const TideContextProvider: React.FC = ({ children }) => {
  const { activeLocation } = useContext(AppContext);

  const [date, setDate] = useState(() => startOfDay(new Date()));
  const tideStations = useMemo(
    () =>
      activeLocation.tidePreditionStations.filter((station) =>
        station.availableParams.includes(NoaaParam.TidePrediction),
      ),
    [activeLocation.tidePreditionStations],
  );
  const sites = useMemo(() => {
    const usgs =
      activeLocation.usgsSites.filter((site) =>
        site.availableParams.includes(UsgsParam.GuageHeight),
      ) || [];

    const noaa =
      activeLocation.tidePreditionStations.filter((station) =>
        station.availableParams.includes(NoaaParam.WaterLevel),
      ) || [];

    return [...noaa, ...usgs];
  }, [activeLocation.tidePreditionStations, activeLocation.usgsSites]);

  const [selectedTideStationId, setSelectedTideStationId] = useState(
    tideStations[0].id,
  );
  const [selectedSite, setSelectedSite] = useState(sites[0]);

  // reset everything back to the default if the location changes
  useEffect(() => {
    setDate(startOfDay(new Date()));
    setSelectedTideStationId(tideStations[0].id);
    setSelectedSite(sites[0]);
  }, [activeLocation, tideStations, sites]);

  const providerValue: TideContext = useMemo(
    () => ({
      date,
      tideStations,
      selectedTideStation: tideStations.find(
        (station) => station.id === selectedTideStationId,
      ),
      sites,
      selectedSite: sites.find((site) => site.id === selectedSite.id),
      actions: {
        setDate,
        setSelectedSite,
        setSelectedTideStationId,
      },
    }),
    [date, selectedTideStationId, selectedSite, tideStations, sites],
  );

  return (
    <TideContext.Provider value={providerValue}>
      {children}
    </TideContext.Provider>
  );
};

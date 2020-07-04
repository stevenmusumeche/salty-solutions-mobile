import { TideStationDetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import {
  useTideStationSites,
  useWaterHeightSites,
} from '@stevenmusumeche/salty-solutions-shared/dist/hooks';
import { startOfDay } from 'date-fns';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DataSite } from '../screens/NowScreen';
import { AppContext } from './AppContext';

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
  const tideStations = useTideStationSites(activeLocation);
  const sites = useWaterHeightSites(activeLocation);

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

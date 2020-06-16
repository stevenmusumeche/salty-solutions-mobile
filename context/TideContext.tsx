import {
  TideStationDetailFragment,
  UsgsParam,
  UsgsSiteDetailFragment,
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

interface TideContext {
  date: Date;
  selectedTideStation?: TideStationDetailFragment;
  tideStations: TideStationDetailFragment[];
  usgsSites: UsgsSiteDetailFragment[];
  selectedUsgsSite?: UsgsSiteDetailFragment;
  actions: {
    setDate: (date: Date) => void;
    setSelectedTideStationId: (id: string) => void;
    setSelectedUsgsSiteId: (id: string) => void;
  };
}

export const TideContext = createContext({} as TideContext);

export const TideContextProvider: React.FC = ({ children }) => {
  const { activeLocation } = useContext(AppContext);

  const [date, setDate] = useState(() => startOfDay(new Date()));
  const tideStations = activeLocation.tidePreditionStations;
  const usgsSites = useMemo(
    () =>
      activeLocation.usgsSites.filter((site) =>
        site.availableParams.includes(UsgsParam.GuageHeight),
      ),
    [activeLocation.usgsSites],
  );

  const [selectedTideStationId, setSelectedTideStationId] = useState(
    tideStations[0].id,
  );
  const [selectedUsgsSiteId, setSelectedUsgsSiteId] = useState(usgsSites[0].id);

  // reset everything back to the default if the location changes
  useEffect(() => {
    setDate(startOfDay(new Date()));
    setSelectedTideStationId(tideStations[0].id);
    setSelectedUsgsSiteId(usgsSites[0].id);
  }, [activeLocation, tideStations, usgsSites]);

  const providerValue: TideContext = useMemo(
    () => ({
      date,
      tideStations,
      selectedTideStation: tideStations.find(
        (station) => station.id === selectedTideStationId,
      ),
      usgsSites,
      selectedUsgsSite: usgsSites.find(
        (site) => site.id === selectedUsgsSiteId,
      ),
      actions: { setDate, setSelectedUsgsSiteId, setSelectedTideStationId },
    }),
    [date, selectedTideStationId, selectedUsgsSiteId, tideStations, usgsSites],
  );

  return (
    <TideContext.Provider value={providerValue}>
      {children}
    </TideContext.Provider>
  );
};

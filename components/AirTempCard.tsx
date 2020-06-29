import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { TideStationDetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import { subHours } from 'date-fns';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import BigBlue from './BigBlue';
import ConditionCard from './ConditionCard';
import { ErrorIcon } from './FullScreenError';
import Graph from './Graph';
import LoaderBlock from './LoaderBlock';
import NoData from './NoData';
import UsgsSiteSelect from './UsgsSiteSelect';

interface Props {
  sites: TideStationDetailFragment[];
  requestRefresh: boolean;
}

const AirTempCard: React.FC<Props> = ({ requestRefresh, sites }) => {
  const headerText = 'Air Temperature (F)';

  const { activeLocation } = useContext(AppContext);

  const [selectedSite, setSelectedSite] = useState(() =>
    sites.length ? sites[0] : undefined,
  );
  const date = useMemo(() => new Date(), []);
  const {
    curValue,
    curDetail,
    fetching,
    error,
    refresh,
  } = hooks.useTemperatureData({
    locationId: activeLocation.id,
    startDate: subHours(date, 48),
    endDate: date,
    noaaStationId:
      selectedSite && selectedSite.__typename === 'TidePreditionStation'
        ? selectedSite.id
        : undefined,
  });

  useEffect(() => {
    setSelectedSite(sites.length ? sites[0] : undefined);
  }, [sites]);

  useEffect(() => {
    if (requestRefresh) {
      refresh({ requestPolicy: 'network-only' });
    }
  }, [requestRefresh, refresh]);

  if (fetching) {
    return (
      <ConditionCard headerText={headerText}>
        <LoaderBlock />
      </ConditionCard>
    );
  }

  if (error) {
    return (
      <ConditionCard headerText={headerText}>
        <View style={styles.errorWrapper}>
          <ErrorIcon />
        </View>
      </ConditionCard>
    );
  }

  return (
    <ConditionCard headerText={headerText}>
      {curValue ? (
        <>
          <BigBlue>{curValue}</BigBlue>
          {curDetail && <Graph data={curDetail} />}
        </>
      ) : (
        <NoData />
      )}
      {selectedSite ? (
        <View style={styles.usgsWrapper}>
          <UsgsSiteSelect
            sites={sites}
            handleChange={(itemValue) => {
              const match = sites.find((site) => site.id === itemValue);
              setSelectedSite(match);
            }}
            selectedId={selectedSite.id}
          />
        </View>
      ) : (
        <View style={styles.spacer} />
      )}
    </ConditionCard>
  );
};

export default AirTempCard;

const styles = StyleSheet.create({
  errorWrapper: {
    justifyContent: 'center',
    flex: 1,
  },
  usgsWrapper: {
    marginTop: 10,
    width: '100%',
  },
  spacer: {
    height: 19.3,
    width: 50,
    marginTop: 10,
  },
});

import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { startOfDay, subHours } from 'date-fns';
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import ConditionCard from './ConditionCard';
import { AppContext } from '../context/AppContext';
import BigBlue from './BigBlue';
import Graph from './Graph';
import LoaderBlock from './LoaderBlock';
import { UsgsSiteDetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import UsgsSiteSelect from './UsgsSiteSelect';
import { ErrorIcon } from './FullScreenError';
import { DataSite } from '../screens/NowScreen';
import NoData from './NoData';

interface Props {
  sites: DataSite[];
  requestRefresh: boolean;
}

const WaterTempCard: React.FC<Props> = ({ sites, requestRefresh }) => {
  const headerText = 'Water Temperature (F)';

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
  } = hooks.useWaterTemperatureData({
    locationId: activeLocation.id,
    startDate: subHours(date, 48),
    endDate: date,
    usgsSiteId:
      selectedSite && selectedSite.__typename === 'UsgsSite'
        ? selectedSite.id
        : undefined,
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

      {selectedSite && (
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
      )}
    </ConditionCard>
  );
};

export default WaterTempCard;

const styles = StyleSheet.create({
  usgsWrapper: {
    marginTop: 10,
    width: '100%',
  },
  errorWrapper: {
    justifyContent: 'center',
    flex: 1,
  },
});

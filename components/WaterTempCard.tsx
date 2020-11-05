import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { subHours } from 'date-fns';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppContext } from '../context/AppContext';
import { DataSite } from '../screens/NowScreen';
import BigBlue from './BigBlue';
import ConditionCard from './ConditionCard';
import { ErrorIcon } from './FullScreenError';
import Graph from './Graph';
import LoaderBlock from './LoaderBlock';
import NoData from './NoData';
import UsgsSiteSelect from './UsgsSiteSelect';

interface Props {
  sites: DataSite[];
  requestRefresh: boolean;
}

const WaterTempCard: React.FC<Props> = ({ sites, requestRefresh }) => {
  const headerText = 'Water Temperature (F)';

  const { activeLocation } = useContext(AppContext);
  const navigation = useNavigation<StackNavigationProp<any>>();

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
          {curDetail && (
            <Graph
              data={curDetail}
              onPress={() =>
                navigation.push('FullScreenGraph', {
                  data: curDetail,
                  title: headerText,
                  siteName: selectedSite ? selectedSite.name : '',
                })
              }
            />
          )}
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

import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { subHours } from 'date-fns';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Path } from 'react-native-svg';
import { VictoryScatter } from 'victory-native';
import { blue } from '../colors';
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

const WindCard: React.FC<Props> = ({ sites, requestRefresh }) => {
  const headerText = 'Wind (mph)';

  const { activeLocation } = useContext(AppContext);

  const [selectedSite, setSelectedSite] = useState(() =>
    sites.length ? sites[0] : undefined,
  );
  const date = useMemo(() => new Date(), []);
  const {
    curValue,
    curDirectionValue,
    fetching,
    curDetail,
    error,
    refresh,
  } = hooks.useCurrentWindData({
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
          <View style={styles.directionWrapper}>
            <Text style={styles.directionText}>{curDirectionValue}</Text>
          </View>
          {curDetail && (
            <Graph data={curDetail}>
              <VictoryScatter dataComponent={<ArrowPoint />} />
            </Graph>
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

export default WindCard;

const styles = StyleSheet.create({
  directionWrapper: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  directionText: {
    color: blue[800],
    fontSize: 18,
  },
  errorWrapper: {
    justifyContent: 'center',
    flex: 1,
  },
  usgsWrapper: {
    marginTop: 10,
    width: '100%',
  },
});

interface ArrowPointProps {
  x: number;
  y: number;
  datum: any;
  index: number;
}

const ArrowPoint: React.FC<ArrowPointProps | any> = ({
  x,
  y,
  index,
  datum,
  data,
}) => {
  const numEntries = data.length;
  if (index % Math.floor(numEntries / 8) !== 0) {
    return null;
  }

  const transformAngle = Math.abs(datum.directionDegrees + 180);
  const adjustedX = x - 5;
  const adjustedY = y - 10;

  return (
    <Path
      scale={0.05}
      x={adjustedX}
      y={adjustedY}
      d="m9.5,238.88542l90.5,-229.88542l90,231l-90,-50l-90.5,49z"
      fill="black"
      transform={`rotate(${transformAngle},110,125)`}
    />
  );
};

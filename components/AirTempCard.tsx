import { hooks } from '@stevenmusumeche/salty-solutions-shared';
import { startOfDay, subHours } from 'date-fns';
import React, { useContext } from 'react';
import { Text } from 'react-native';
import Card from '../components/Card';
import { AppContext } from '../context/AppContext';
import BigBlue from './BigBlue';
import Graph from './Graph';
import LoaderBlock from './LoaderBlock';

const AirTempCard: React.FC = () => {
  const headerText = 'Air Temperature (F)';

  const { activeLocation } = useContext(AppContext);
  const date = startOfDay(new Date());
  const { curValue, curDetail, fetching, error } = hooks.useTemperatureData(
    activeLocation.id,
    subHours(date, 48),
    date,
  );

  if (fetching) {
    return (
      <Card headerText={headerText}>
        <LoaderBlock />
      </Card>
    );
  }

  if (error) {
    return <Text>Error</Text>;
  }

  return (
    <Card headerText={headerText}>
      <BigBlue>{curValue}</BigBlue>
      {curDetail && <Graph data={curDetail} />}
    </Card>
  );
};

export default AirTempCard;

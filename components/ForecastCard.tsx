import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CombinedForecastDetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import WaterConditionIcon from './WaterConditionIcon';
import Compass from './svg/Compass';

interface Props {
  datum: CombinedForecastDetailFragment;
}

const ForecastCard: React.FC<Props> = ({ datum }) => {
  let windDisplay;
  let degrees;
  if (datum.wind && datum.wind.speed && datum.wind.direction) {
    const from = datum.wind.speed.from;
    const to = datum.wind.speed.to;
    degrees = datum.wind.direction ? datum.wind.direction.degrees + 180 : null;
    if (from === to) {
      windDisplay = `${to} ${datum.wind.direction.text}`;
    } else {
      windDisplay = `${from}-${to} ${datum.wind.direction.text}`;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardWrapper}>
        <Text style={styles.timePeriod}>{datum.timePeriod}</Text>
        <View style={styles.summaryWrapper}>
          <View style={styles.windWrapper}>
            <Compass
              width={'50'}
              height={'50'}
              transform={[{ rotate: `${degrees}deg` }]}
            />
            <Text style={styles.windDisplay}>{windDisplay}</Text>
          </View>
          <View style={styles.waterWrapper}>
            <WaterConditionIcon
              text={
                datum.waterCondition ? datum.waterCondition.text : undefined
              }
            />
          </View>
          <View style={styles.tempWrapper}>
            <View style={{}}>
              <View style={styles.summaryCalloutWrapper}>
                <View>
                  <Text style={styles.summaryCallout}>
                    {datum.temperature.degrees}°
                  </Text>
                </View>
                <View>
                  <Text style={styles.summaryLabel}>F</Text>
                </View>
              </View>
              {datum.chanceOfPrecipitation !== null && (
                <View style={styles.summaryCalloutWrapper}>
                  <View>
                    <Text style={styles.summaryCallout}>
                      {datum.chanceOfPrecipitation}%
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.summaryLabel}>rain</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
        {datum.marine ? (
          <>
            <Text style={styles.forecastPrimary}>{datum.marine}</Text>
            <Text style={styles.forecastSecondary}>{datum.detailed}</Text>
          </>
        ) : (
          <Text>{datum.detailed}</Text>
        )}
      </View>
    </View>
  );
};

export default ForecastCard;

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  cardWrapper: {
    padding: 10,
    backgroundColor: 'white',
    flexGrow: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 3,
  },
  timePeriod: {
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
    fontSize: 20,
  },
  summaryWrapper: {
    marginVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  windWrapper: {
    width: '20%',
    alignItems: 'center',
  },
  windDisplay: {
    textAlign: 'center',
    color: '#2d3748',
    fontSize: 10.5,
  },
  waterWrapper: {
    width: '45%',
  },
  forecastPrimary: {
    marginBottom: 10,
  },
  forecastSecondary: {
    fontSize: 12.5,
    color: '#4a5568',
  },
  tempWrapper: {
    width: '30%',
  },
  summaryCalloutWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  summaryCallout: {
    color: '#2d3748',
    fontSize: 21,
    width: 50,
  },
  summaryLabel: {
    color: '#718096',
    fontSize: 10.5,
    paddingBottom: 2,
  },
});

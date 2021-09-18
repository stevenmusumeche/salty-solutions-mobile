import { MaterialIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';
import React, { useContext, useState } from 'react';
import { Button, StatusBar, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import TideStationSelect from '../components/TideStationSelect';
import UsgsSiteSelect from '../components/UsgsSiteSelect';
import { TideContext } from '../context/TideContext';
import { blue, gray, white, black, red } from '../colors';
import { trackEvent } from '../context/AppContext';

interface Props {
  navigation: StackNavigationProp<any>;
}

const TideOptionsScreen: React.FC<Props> = ({ navigation }) => {
  const {
    date,
    tideStations,
    selectedTideStation,
    selectedSite,
    sites,
    actions,
  } = useContext(TideContext);

  const [selectedDate, setSelectedDate] = useState(date);
  const [selectedStationId, setSelectedStationId] = useState(
    selectedTideStation?.id ?? '',
  );
  const [userSelectedSite, setUserSelectedSite] = useState(selectedSite!);

  const saveSettings = () => {
    trackEvent('Save Tide Options');
    actions.setSelectedTideStationId(selectedStationId);
    actions.setSelectedSite(userSelectedSite);
    actions.setDate(selectedDate);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.cardWrapper}>
        <View style={styles.closeButtonWrapper}>
          <TouchableOpacity
            onPress={() => {
              trackEvent('Close Tide Options');
              return navigation.goBack();
            }}
            style={styles.closeButton}
          >
            <MaterialIcons name="close" size={20} color={gray[600]} />
          </TouchableOpacity>
        </View>
        <DateSelect date={selectedDate} setDate={setSelectedDate} />
        <View style={(styles.fullWidth, { marginBottom: 10 })}>
          <Text style={styles.selectLabel}>Tide Station:</Text>
          <TideStationSelect
            tideStations={tideStations}
            selectedId={selectedStationId}
            handleChange={(stationId) => {
              if (stationId) {
                setSelectedStationId(stationId);
              }
            }}
          />
        </View>
        <View style={styles.usgsSelectWrapper}>
          <Text style={styles.selectLabel}>Observation Site:</Text>
          <UsgsSiteSelect
            sites={sites}
            selectedId={userSelectedSite.id}
            handleChange={(itemValue) => {
              const match = sites.find((site) => site.id === itemValue);
              if (!match) {
                return;
              }
              setUserSelectedSite(match);
            }}
            style={{
              inputIOS: {
                fontSize: undefined,
                backgroundColor: white,
                paddingVertical: 6,
                paddingHorizontal: 10,
              },
              inputAndroid: {
                height: 30,
                fontSize: undefined,
                backgroundColor: white,
                paddingVertical: 6,
                paddingHorizontal: 10,
              },
              iconContainer: {
                top: 5,
                right: 5,
              },
            }}
          />
        </View>
        <Button
          color={blue[600]}
          title="Save Tide Settings"
          onPress={saveSettings}
        />
      </View>
    </View>
  );
};

export default TideOptionsScreen;

const DateSelect: React.FC<{ date: Date; setDate: (date: Date) => void }> = ({
  setDate,
  date,
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    hideDatePicker();
    setDate(date);
  };

  return (
    <View style={styles.fullWidth}>
      <Text style={styles.selectLabel}>Date:</Text>
      <TouchableOpacity onPress={showDatePicker}>
        <View style={styles.dateWrapper}>
          <Text>{format(date, 'EEEE, MMMM d, yyyy')}</Text>
          <View style={styles.dateCaret}>
            <MaterialIcons name="arrow-drop-down" size={20} color={blue[800]} />
          </View>
        </View>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        date={date}
        onCancel={hideDatePicker}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  cardWrapper: {
    backgroundColor: white,
    width: '100%',
    padding: 20,
    borderRadius: 8,
    shadowColor: black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 3,
  },
  selectLabel: {
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  dateWrapper: {
    backgroundColor: white,
    borderWidth: 1,
    borderColor: gray[300],
    borderRadius: 4,
    color: 'black',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateCaret: {
    position: 'absolute',
    right: 5,
    top: 5,
  },
  usgsSelectWrapper: {
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  closeButtonWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: gray[200],
    borderRadius: 11.5,
    padding: 3,
  },
});

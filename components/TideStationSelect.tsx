import { MaterialIcons } from '@expo/vector-icons';
import { TideStationDetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import React from 'react';
import { StyleSheet } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { blue, gray, white } from '../colors';

const TideStationSelect: React.FC<{
  tideStations: TideStationDetailFragment[];
  handleChange: (selectedItem: string) => void;
  selectedId: string;
}> = ({ tideStations, handleChange, selectedId }) => {
  return (
    <RNPickerSelect
      useNativeAndroidPickerStyle={false}
      value={selectedId}
      placeholder={{ label: 'Select Tide Station:' }}
      onValueChange={handleChange}
      items={tideStations.map((tideStation) => ({
        label: tideStation.name,
        value: tideStation.id,
      }))}
      style={pickerSelectStyles}
      Icon={() => {
        return (
          <MaterialIcons name="arrow-drop-down" size={20} color={blue[800]} />
        );
      }}
    />
  );
};

export default TideStationSelect;

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    borderWidth: 1,
    borderColor: gray[300],
    borderRadius: 4,
    color: 'black',
    paddingRight: 16, // to ensure the text is never behind the icon
    backgroundColor: white,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  inputAndroid: {
    height: 30,
    borderWidth: 0.5,
    borderColor: gray[300],
    borderRadius: 4,
    color: 'black',
    paddingRight: 16, // to ensure the text is never behind the icon
    backgroundColor: white,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  iconContainer: {
    top: 5,
    right: 5,
  },
});

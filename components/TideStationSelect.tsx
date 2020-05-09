import React from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {
  UsgsSiteDetailFragment,
  TideStationDetailFragment,
} from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import deepMerge from 'deepmerge';

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
          <MaterialIcons name="arrow-drop-down" size={20} color="#2c5282" />
        );
      }}
    />
  );
};

export default TideStationSelect;

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    color: 'black',
    paddingRight: 16, // to ensure the text is never behind the icon
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  inputAndroid: {
    height: 30,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    color: 'black',
    paddingRight: 16, // to ensure the text is never behind the icon
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  iconContainer: {
    top: 5,
    right: 5,
  },
});

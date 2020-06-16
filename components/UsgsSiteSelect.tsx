import React, { useCallback } from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { UsgsSiteDetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import deepMerge from 'deepmerge';

const UsgsSiteSelect: React.FC<{
  sites: UsgsSiteDetailFragment[];
  handleChange: (selectedItem: string) => void;
  selectedId: string;
  style?: any;
}> = ({ sites, handleChange, selectedId, style = {} }) => {
  const onValueChange = useCallback(
    (selectedItem) => {
      if (selectedItem) {
        handleChange(selectedItem);
      }
    },
    [handleChange],
  );

  return (
    <RNPickerSelect
      useNativeAndroidPickerStyle={false}
      value={selectedId}
      placeholder={{ label: 'Select Observation Site:' }}
      onValueChange={onValueChange}
      items={sites.map((site) => ({
        label: site.name,
        value: site.id,
      }))}
      style={deepMerge(pickerSelectStyles, style)}
      Icon={() => {
        return (
          <MaterialIcons name="arrow-drop-down" size={20} color="#2c5282" />
        );
      }}
    />
  );
};

export default UsgsSiteSelect;

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 11,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    color: 'black',
    paddingRight: 16, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    height: 20,
    fontSize: 11,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    color: 'black',
    paddingRight: 16, // to ensure the text is never behind the icon
  },
});

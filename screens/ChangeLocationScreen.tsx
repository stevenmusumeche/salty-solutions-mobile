import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { LocationDetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import React, { useContext } from 'react';
import {
  Button,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { black, brandYellow, gray, white } from '../colors';
import { AppContext } from '../context/AppContext';

const LocationTabs = createBottomTabNavigator();

const ChangeLocationScreen = () => {
  return (
    <LocationTabs.Navigator
      tabBarOptions={{
        activeTintColor: brandYellow,
        inactiveTintColor: white,
      }}
    >
      <LocationTabs.Screen
        name="Louisiana"
        options={{
          tabBarIcon: ({ color, size }) => (
            <LetterIcon size={size} color={color} letter={'L'} />
          ),
        }}
      >
        {() => <LocationListScreen state="LA" />}
      </LocationTabs.Screen>
      <LocationTabs.Screen
        name="Texas"
        options={{
          tabBarIcon: ({ color, size }) => (
            <LetterIcon size={size} color={color} letter={'T'} />
          ),
        }}
      >
        {() => <LocationListScreen state="TX" />}
      </LocationTabs.Screen>
    </LocationTabs.Navigator>
  );
};

const LetterIcon: React.FC<{ letter: string; color: string; size: number }> = ({
  letter,
  color,
  size,
}) => <Text style={{ color, fontSize: size }}>{letter}</Text>;

interface Props {
  state: string;
}

const LocationListScreen: React.FC<Props> = ({ state }) => {
  const navigation = useNavigation();
  const { locations, activeLocation, actions } = useContext(AppContext);

  const handleLocationSelection = async (location: LocationDetailFragment) => {
    actions.setLocation(location);
    navigation.navigate('Now');
  };

  const data = locations.filter((location) => location.state === state);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={{}}>Select Location</Text>
      <FlatList
        style={styles.list}
        data={data}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={HeaderFooter}
        ListFooterComponent={HeaderFooter}
        renderItem={({ item }) => {
          const isActive = item.id === activeLocation.id;
          return (
            <TouchableOpacity onPress={() => handleLocationSelection(item)}>
              <View style={styles.listItem}>
                <Text
                  style={[
                    styles.listItemText,
                    { fontWeight: isActive ? 'bold' : 'normal' },
                  ]}
                >
                  {item.name}
                </Text>
                <View>
                  <MaterialIcons
                    name={isActive ? 'check-box' : 'check-box-outline-blank'}
                    size={24}
                    color={isActive ? gray[800] : gray[600]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <View style={styles.cancelWrapper}>
        <Button
          color={black}
          title="Cancel"
          onPress={() => navigation.navigate('Now')}
        />
      </View>
    </SafeAreaView>
  );
};

const Separator = () => <View style={styles.separator} />;
const HeaderFooter = () => <View style={styles.headerFooter} />;

export default ChangeLocationScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  list: {
    marginTop: 10,
    width: '100%',
  },
  listItem: {
    backgroundColor: white,
    paddingHorizontal: 15,
    paddingVertical: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemText: {
    fontSize: 18,
  },
  separator: {
    height: 1,
    backgroundColor: gray[300],
  },
  headerFooter: {
    height: 2,
    backgroundColor: gray[400],
  },
  cancelWrapper: {
    paddingVertical: 5,
    width: '100%',
    backgroundColor: brandYellow,
  },
});

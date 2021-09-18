import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { LocationDetailFragment } from '@stevenmusumeche/salty-solutions-shared/dist/graphql';
import React, { useContext } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import { brandYellow, brandYellow30, gray, red, white } from '../colors';
import { AppContext, trackEvent } from '../context/AppContext';

const LocationTabs = createBottomTabNavigator();

const ChangeLocationScreen = () => {
  return (
    <LocationTabs.Navigator
      screenOptions={{
        tabBarActiveTintColor: brandYellow,
        tabBarInactiveTintColor: white,
        headerShown: false,
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
    trackEvent('Location Selected', {
      locationId: location.id,
      name: location.name,
    }).catch((e) => console.error(e));
    actions.setLocation(location);
    navigation.dispatch(CommonActions.navigate({ name: 'Now' }));
  };

  const data = locations.filter((location) => location.state === state);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        style={styles.list}
        data={data}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={Separator}
        ListFooterComponent={Footer}
        renderItem={({ item }) => {
          const isActive = item.id === activeLocation.id;
          return (
            <TouchableOpacity onPress={() => handleLocationSelection(item)}>
              <View
                style={[
                  styles.listItem,
                  { backgroundColor: isActive ? brandYellow30 : 'white' },
                ]}
              >
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
          color={red[700]}
          title="Cancel"
          onPress={() =>
            navigation.dispatch(CommonActions.navigate({ name: 'Now' }))
          }
        />
      </View>
    </SafeAreaView>
  );
};

const Separator = () => <View style={styles.separator} />;

const Footer = () => <View style={styles.footer} />;

export default ChangeLocationScreen;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: white,
  },
  list: {
    marginTop: 0,
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
  footer: {
    height: 1,
    backgroundColor: gray[400],
  },
  cancelWrapper: {
    paddingVertical: 5,
    width: '100%',
    backgroundColor: white,
  },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  headerText: string;
}

const ConditionCard: React.FC<Props> = ({ headerText, children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.cardWrapper}>
        <View style={styles.header}>
          <Text style={styles.headerText}>{headerText}</Text>
        </View>
        <View style={styles.children}>{children}</View>
      </View>
    </View>
  );
};

export default ConditionCard;

const styles = StyleSheet.create({
  container: {
    width: '50%',
    padding: 10,
  },
  cardWrapper: {
    backgroundColor: 'white',
    flexGrow: 1,
    alignItems: 'center',
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
  header: {
    backgroundColor: '#edf2f7',
    width: '100%',
    alignItems: 'center',
    padding: 8,
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: {
    fontSize: 12,
  },
  children: {
    flex: 1,
    width: '100%',
    flexGrow: 1,
    alignItems: 'center',
    padding: 10,
  },
});

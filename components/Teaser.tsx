import React from 'react';
import { Text, StyleSheet, Button, View } from 'react-native';
import { gray, white } from '../colors';
import { useUserContext } from '../context/UserContext';

interface Props {
  title: string;
  description: string;
  buttonText?: string;
  buttonSubtitle: string;
}

const Teaser: React.FC<Props> = ({
  title,
  description,
  buttonSubtitle,
  buttonText = 'Login Now',
}) => {
  const { actions } = useUserContext();

  return (
    <View style={[styles.container, { backgroundColor: white }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={{ marginBottom: 15 }}>{description}</Text>
      <Button onPress={actions.login} title={buttonText} />
      <Text style={{ color: gray[700], textAlign: 'center' }}>
        {buttonSubtitle}
      </Text>
    </View>
  );
};

export default Teaser;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontWeight: '600',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 15,
  },
});

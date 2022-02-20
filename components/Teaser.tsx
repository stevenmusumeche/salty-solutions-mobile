import React from 'react';
import { Text, StyleSheet, Button, View } from 'react-native';
import { gray, white } from '../colors';
import { usePurchaseContext } from '../context/PurchaseContext';

interface Props {
  title: string;
  description: string;
  buttonSubtitle: string;
}

const Teaser: React.FC<Props> = ({ title, description, buttonSubtitle }) => {
  const { products, purchase } = usePurchaseContext();

  const premium = products.find((product) =>
    product.productId.startsWith('premium.monthly'),
  );
  if (!premium) {
    return null;
  }

  let buttonText = 'Buy ' + premium.description;

  return (
    <View style={[styles.container, { backgroundColor: white }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={{ marginBottom: 15 }}>{description}</Text>
      <Button onPress={() => purchase(products[0])} title={buttonText} />

      <Text style={{ color: gray[700], textAlign: 'center' }}>
        {buttonSubtitle} Only {premium.price} per month. No contract required.
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

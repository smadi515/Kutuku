// screens/PaymentScreen.tsx
import React from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import {useRoute} from '@react-navigation/native';

const PaymentScreen = () => {
  const {params} = useRoute();
  const {selectedItems, subtotal, total}: any = params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment Details</Text>
      <FlatList
        data={selectedItems}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.item}>
            <Text>
              {item.title} x {item.quantity}
            </Text>
            <Text>${(item.price * item.quantity).toFixed(2)}</Text>
          </View>
        )}
      />
      <Text>Subtotal: ${subtotal.toFixed(2)}</Text>
      <Text>Shipping: $6.00</Text>
      <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  title: {fontWeight: 'bold', fontSize: 18, marginBottom: 10},
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  total: {marginTop: 10, fontWeight: 'bold'},
});

export default PaymentScreen;

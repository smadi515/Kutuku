import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const MyOrders = () => (
  <View style={styles.container}>
    <Text>MyOrders</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MyOrders;

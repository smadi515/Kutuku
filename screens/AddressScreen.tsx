// screens/AddressScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from '../components/icon';
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';

const AddressScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddressScreen'>>();
  const {
    selectedItems,
    subtotal,
    total,
    address: incomingAddress = '',
  } = route.params;

  const [address, setAddress] = useState(incomingAddress);

  const handleMapSelect = () => {
    // Mock map selection
    setAddress('123 Main St, City, Country');
  };
  const handleConfirm = () => {
    navigation.navigate('PaymentScreen', {
      selectedItems,
      subtotal,
      total,
      address,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter your address:</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Your address"
          value={address}
          onChangeText={setAddress}
        />
        <TouchableOpacity onPress={handleMapSelect}>
          <Icon name="map" type="feather" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
        <Text style={styles.confirmText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  label: {fontSize: 16, marginBottom: 10},
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  input: {flex: 1, height: 40},
  confirmBtn: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmText: {color: '#fff', fontWeight: 'bold'},
});

export default AddressScreen;

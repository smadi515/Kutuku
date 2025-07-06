import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Alert, Switch, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import {RootStackParamList} from '../App';
import Header from '../components/Header';

type RouteParams = RouteProp<RootStackParamList, 'EditAddressScreen'>;

const EditAddressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const {addressId} = route.params;

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [postcode, setPostcode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    const fetchAddress = async () => {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(
        `https://api.sareh-nomow.xyz/api/addresses/${addressId}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      const data = await res.json();
      setFullName(data.full_name || '');
      setPhoneNumber(data.phone_number || '');
      setAddress1(data.address_1 || '');
      setAddress2(data.address_2 || '');
      setPostcode(data.postcode || '');
      setIsDefault(data.is_default || false);
    };
    fetchAddress();
  }, [addressId]);

  const handleEditAddress = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(
        `https://api.sareh-nomow.xyz/api/addresses/${addressId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: fullName,
            phone_number: phoneNumber,
            address_1: address1,
            address_2: address2,
            postcode,
            is_default: isDefault,
          }),
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      Alert.alert('Success', 'Address updated successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Edit Address" showImage={false} showBack={true} />

      <CustomInput
        label="Full Name"
        placeholder="Enter full name"
        iconType="feather"
        iconName="user"
        value={fullName}
        onChangeText={setFullName}
      />
      <CustomInput
        label="Phone Number"
        placeholder="Enter phone number"
        iconType="feather"
        iconName="phone"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <CustomInput
        label="Address 1"
        placeholder="Enter address"
        iconType="feather"
        iconName="map-pin"
        value={address1}
        onChangeText={setAddress1}
      />
      <CustomInput
        label="Address 2"
        placeholder="Enter address"
        iconType="feather"
        iconName="map"
        value={address2}
        onChangeText={setAddress2}
      />
      <CustomInput
        label="Postcode"
        placeholder="Enter postcode"
        iconType="feather"
        iconName="hash"
        value={postcode}
        onChangeText={setPostcode}
      />
      <Switch value={isDefault} onValueChange={val => setIsDefault(val)} />
      <View style={{alignItems: 'center', width: '100%'}}>
        <CustomButton text="Confirm Edit" onPress={handleEditAddress} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
});

export default EditAddressScreen;

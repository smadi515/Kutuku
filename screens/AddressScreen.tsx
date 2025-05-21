import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Modal,
  FlatList,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import CustomInput from '../components/CustomInput';
import {createAddress} from '../lib/api';

interface City {
  id: number;
  name: string;
  country_id: number;
}

interface Country {
  id: number;
  name: string;
  Cities: City[];
}

const AddressScreen = () => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [postcode, setPostcode] = useState('');

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
    };

    const fetchCountries = async () => {
      try {
        const response = await fetch(
          'http://192.168.100.13:3250/api/countries',
        );
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error('Error fetching countries:', error);
      }
    };

    fetchToken();
    fetchCountries();
  }, []);

  const handleConfirm = async () => {
    const missingFields: string[] = [];

    if (!fullName.trim()) missingFields.push('Full Name');
    if (!phoneNumber.trim()) missingFields.push('Phone Number');
    if (!address1.trim()) missingFields.push('Address 1');
    if (!postcode.trim()) missingFields.push('Postcode');
    if (!selectedCountry) missingFields.push('Country');
    if (!selectedCity) missingFields.push('City');

    if (missingFields.length > 0) {
      Alert.alert(
        'Missing Information',
        `Please fill in the following fields:\n\n${missingFields.join('\n')}`,
      );
      return;
    }

    if (!token) {
      Alert.alert('Error', 'You are not logged in.');
      return;
    }

    // Now that we've validated selectedCountry and selectedCity are not null,
    // TypeScript will not complain about accessing their properties
    try {
      const newAddress = {
        full_name: fullName,
        phone_number: phoneNumber,
        address_1: address1,
        address_2: address2,
        postcode,
        country_id: selectedCountry!.id, // safe to use '!' after the null check above
        city_id: selectedCity!.id,
      };

      console.log('Sending address:', newAddress);

      await createAddress(newAddress, token);
    } catch (error) {
      console.error('Error creating address:', error);
      Alert.alert('Error', 'Failed to create address.');
    }
  };
  const handleNumericInput =
    (setter: (value: string) => void) =>
    (text: string): void => {
      const cleaned = text.replace(/[^0-9]/g, '');
      setter(cleaned);
    };
  return (
    <View style={{flex: 1}}>
      <Header title="Address" showBack={true} showImage={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView contentContainerStyle={{padding: 10}}>
          <Text style={styles.label}>Enter your address:</Text>

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
            onChangeText={handleNumericInput(setPhoneNumber)}
            keyboardType="numeric"
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
            placeholder="Enter address line 2"
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
            onChangeText={handleNumericInput(setPostcode)}
          />

          {/* Country dropdown */}
          <Text style={styles.dropdownLabel}>Country</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setCountryModalVisible(true)}>
            <Text>
              {selectedCountry ? selectedCountry.name : 'Select Country'}
            </Text>
          </TouchableOpacity>

          {/* City dropdown */}
          <Text style={styles.dropdownLabel}>City</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setCityModalVisible(true)}
            disabled={!selectedCountry}>
            <Text>
              {selectedCity
                ? selectedCity.name
                : selectedCountry
                ? 'Select City'
                : 'Choose Country First'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Modal */}
      <Modal visible={countryModalVisible} animationType="slide">
        <FlatList
          data={countries}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                setSelectedCountry(item);
                setSelectedCity(null); // reset city
                setCountryModalVisible(false);
              }}>
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </Modal>

      {/* City Modal */}
      <Modal visible={cityModalVisible} animationType="slide">
        <FlatList
          data={selectedCountry?.Cities || []}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                setSelectedCity(item);
                setCityModalVisible(false);
              }}>
              <Text>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  dropdownLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    marginTop: 5,
  },
  confirmBtn: {
    backgroundColor: 'purple',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  option: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default AddressScreen;

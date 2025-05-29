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
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import {useTranslation} from 'react-i18next';

interface MethodDetails {
  id: number;
  name: string;
}
interface ZoneMethod {
  cost: number;
  shipping_zone_method_id: number; // <-- Add this
  method: MethodDetails;
}
interface City {
  id: number;
  name: string;
  country_id: number;
}
interface ShippingZone {
  shipping_zone_id: number;
  name: string;
  country_id: number;
  uuid: string;
  zone_methods: ZoneMethod[] | null;
}
interface Shipping {
  id: number;
  cost: number;
  name: string;
}
interface Country {
  id: number;
  name: string;
  Cities: City[];
  ShippingZone: ShippingZone[];
}
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AddressScreen = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [postcode, setPostcode] = useState('');

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [shippingCost, setShippingCost] = useState<Shipping | null>(null);

  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [ShippingModalVisible, setShippingModalVisible] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const navigation = useNavigation<NavigationProp>();

  const fetchCountry = async (id: number) => {
    try {
      const response = await fetch(
        `https://api.sareh-nomow.xyz/api/countries/${id}`,
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
    };

    const fetchCountries = async () => {
      try {
        const response = await fetch(
          'https://api.sareh-nomow.xyz/api/countries',
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
    const missingFields = [];
    if (!fullName.trim()) missingFields.push('Full Name');
    if (!phoneNumber.trim()) missingFields.push('Phone Number');
    if (!address1.trim()) missingFields.push('Address 1');
    if (!postcode.trim()) missingFields.push('Postcode');
    if (!selectedCountry) missingFields.push('Country');
    if (!selectedCity) missingFields.push('City');
    if (!shippingCost) missingFields.push('Shipping Method');

    if (missingFields.length > 0) {
      Alert.alert(
        'Missing Information',
        `Please fill in:\n${missingFields.join('\n')}`,
      );
      return;
    }

    if (!token) {
      Alert.alert('Error', 'You are not logged in.');
      return;
    }

    try {
      const newAddress = {
        full_name: fullName,
        phone_number: phoneNumber,
        address_1: address1,
        address_2: address2,
        postcode,
        country_id: selectedCountry!.id,
        city_id: selectedCity!.id,
      };

      const createdAddress = await createAddress(newAddress, token);
      const addressId = createdAddress.id;

      // 🛒 Step 1: Get Cart ID
      const getEffectiveCartId = async (): Promise<number | null> => {
        const storedCartId = await AsyncStorage.getItem('cartId');
        return storedCartId ? Number(storedCartId) : null;
      };

      const cartId = await getEffectiveCartId();
      if (!cartId) throw new Error('Cart ID not found.');

      // 📦 Step 2: Attach Address to Cart
      await fetch(
        `https://api.sareh-nomow.xyz/api/carts/${cartId}/shipping-address/${addressId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // 🚚 Step 3: Attach Shipping Method to Cart
      await fetch(
        `https://api.sareh-nomow.xyz/api/carts/${cartId}/shipping-method/${
          shippingCost!.id
        }`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ✅ Navigate to payment after updates
      navigation.navigate('PaymentScreen', {
        cartId,
        addressId,
        shippingZoneMethodId: shippingCost!.id,
        shippingCost: shippingCost!.cost,
        shippingMethodName: shippingCost!.name,
      });
    } catch (error) {
      console.error('❌ Error in handleConfirm:', error);
      Alert.alert('Error', 'Failed to confirm address and shipping method.');
    }
  };

  const handleNumericInput =
    (setter: (value: string) => void) => (text: string) => {
      setter(text.replace(/[^0-9]/g, ''));
    };

  const getShippingMethods = (): Shipping[] => {
    if (!selectedCountry || !Array.isArray(selectedCountry.ShippingZone)) {
      console.warn('⚠️ No selected country or ShippingZone is not an array.');
      return [];
    }

    return selectedCountry.ShippingZone.flatMap((zone, zoneIndex) => {
      if (!zone || typeof zone !== 'object') {
        console.warn(`❌ zone is not a valid object at index ${zoneIndex}`);
        return [];
      }

      const methods = zone.zone_methods;
      console.log(`📦 Zone ${zoneIndex} (${zone.name}) - Methods:`, methods);
      console.log('zone', zone);
      console.log('zone methods', methods);
      console.log('zone methods', zone.zone_methods);

      if (!Array.isArray(methods)) {
        console.warn(
          `❌ zone_methods is not an array in zone ${zoneIndex} (${zone.name}) of country: ${selectedCountry.name}`,
        );
        return [];
      }

      if (methods.length === 0) {
        console.warn(
          `⚠️ zone_methods is empty in zone ${zoneIndex} (${zone.name}) of country: ${selectedCountry.name}`,
        );
        return [];
      }

      return methods
        .filter(
          method => method?.method?.name && typeof method.cost === 'number',
        )
        .map(method => {
          console.log(
            `➡️ shipping_zone_method_id: ${method.shipping_zone_method_id} in zone: ${zone.name}`,
          );
          return {
            id: method.shipping_zone_method_id, // <-- ✅ Correct ID
            cost: method.cost,
            name: method.method.name,
            shipping_zone_method_id: zone.shipping_zone_id, // include shipping_zone_method_id for use in PaymentScreen
          };
        });
    });
  };
  const onCountryChange = async (item: Country) => {
    console.log('🌍 Selected Country:', item.id);
    if (!Array.isArray(item.ShippingZone)) {
      console.warn(`❌ Country ${item.name} has no valid ShippingZone array.`);
    }
    if (!Array.isArray(item.ShippingZone) || item.ShippingZone.length === 0) {
      console.warn(`❌ No ShippingZone defined for country: ${item.name}`);
    } else {
      item.ShippingZone.forEach((zone, index) => {
        console.log(`📦 Zone ${index} (${zone.name})`);
        if (!Array.isArray(zone.zone_methods)) {
          console.warn(
            `❌ zone_methods is not an array in zone ${index} of country: ${item.name}`,
          );
        } else if (zone.zone_methods.length === 0) {
          console.warn(
            `⚠️ zone_methods is empty in zone ${index} of country: ${item.name}`,
          );
        } else {
          console.log(
            `✅ zone_methods (${zone.zone_methods.length}) in zone ${index} of ${item.name}`,
          );
          zone.zone_methods.forEach(method => {
            console.log(
              `➡️ Method: ${method.method?.name}, Cost: ${method.cost}`,
            );
          });
        }
      });
    }

    // setSelectedCountry(item);
    // call api to get country details and set selected country
    const _country = await fetchCountry(item.id);
    console.log('🌍 Fetched Country:', _country);
    setSelectedCountry(_country);

    setSelectedCity(null);
    setShippingCost(null);
    setCountryModalVisible(false);
  };

  return (
    <View style={{flex: 1}}>
      <Header
        title={t('AddressScreen.title')}
        showBack={true}
        showImage={false}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1, direction: isRTL ? 'rtl' : 'ltr'}}>
        <ScrollView contentContainerStyle={{padding: 10}}>
          <Text style={styles.label}>{t('AddressScreen.enter_address')}</Text>

          <CustomInput
            label={t('AddressScreen.full_name')}
            placeholder={t('AddressScreen.enter_full_name')}
            iconType="feather"
            iconName="user"
            value={fullName}
            onChangeText={setFullName}
          />
          <CustomInput
            label={t('AddressScreen.phone_number')}
            placeholder={t('AddressScreen.enter_phone_number')}
            iconType="feather"
            iconName="phone"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <CustomInput
            label={t('AddressScreen.address1')}
            placeholder={t('AddressScreen.enter_address1')}
            iconType="feather"
            iconName="map-pin"
            value={address1}
            onChangeText={setAddress1}
          />
          <CustomInput
            label={t('AddressScreen.address2')}
            placeholder={t('AddressScreen.enter_address2')}
            iconType="feather"
            iconName="map"
            value={address2}
            onChangeText={setAddress2}
          />
          <CustomInput
            label={t('AddressScreen.postcode')}
            placeholder={t('AddressScreen.enter_postcode')}
            iconType="feather"
            iconName="hash"
            value={postcode}
            onChangeText={handleNumericInput(setPostcode)}
          />

          <Text style={styles.dropdownLabel}>{t('AddressScreen.country')}</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setCountryModalVisible(true)}>
            <Text>
              {selectedCountry
                ? selectedCountry.name
                : t('AddressScreen.select_country')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dropdownLabel}>{t('AddressScreen.city')}</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setCityModalVisible(true)}
            disabled={!selectedCountry}>
            <Text>
              {selectedCity
                ? selectedCity.name
                : selectedCountry
                ? t('AddressScreen.select_city')
                : t('AddressScreen.choose_country_first')}
            </Text>
          </TouchableOpacity>

          <Text style={styles.dropdownLabel}>
            {t('AddressScreen.shipping')}
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShippingModalVisible(true)}
            disabled={!selectedCountry}>
            <Text>
              {shippingCost
                ? `${shippingCost.name} - ${shippingCost.cost} JOD`
                : selectedCountry
                ? t('AddressScreen.select_shipping_method')
                : t('AddressScreen.choose_country_first')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
            <Text style={styles.confirmText}>{t('AddressScreen.confirm')}</Text>
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
              onPress={() => onCountryChange(item)}>
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

      {/* Shipping Modal */}
      <Modal visible={ShippingModalVisible} animationType="slide">
        <FlatList
          data={getShippingMethods()}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                setShippingCost(item);
                console.log(
                  `Selected shipping method: ${item.name} with shipping_zone_method_id: ${item.id}`,
                );
                setShippingModalVisible(false);
              }}>
              <Text>
                {item.name} - {item.cost} JOD
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={() => (
            <View style={{padding: 20}}>
              <Text>{t('AddressScreen.no_shipping_methods')}</Text>
            </View>
          )}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {fontSize: 16, marginBottom: 10},
  dropdownLabel: {marginTop: 10, fontSize: 14, fontWeight: '500'},
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

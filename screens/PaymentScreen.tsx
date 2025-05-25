import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import Header from '../components/Header';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCartItems } from '../lib/api';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

interface Address {
  id: string;
  street: string;
  city: string;
  country: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'PaymentScreen'>;
type RouteProps = RouteProp<RootStackParamList, 'PaymentScreen'>;

const PaymentScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  // Extract params from route
  const { cartId, addressId, shippingCost: initialShippingCost = 0, shippingMethodName: initialShippingMethodName = '', shippingZoneMethodId } = route.params;

  const [shippingCost, setShippingCost] = useState<number>(initialShippingCost);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [shippingMethodName, setShippingMethodName] = useState<string>(initialShippingMethodName);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(addressId ? addressId.toString() : null);

  const bottomSheetRef = useRef<BottomSheet>(null);     // Payment method selection sheet
  const confirmationSheetRef = useRef<BottomSheet>(null); // Order confirmation sheet

  const snapPoints = useMemo(() => [250], []);

  // Load cart items on mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const cart = await getCartItems(token);
        if (cart && cart.items) {
          setCartItems(cart.items);
          const total = cartItems.reduce((acc, item) => acc + item.product_price * item.qty, 0);
          setSubtotal(total);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    };
    fetchCart();
  }, []);

  // Load user addresses on mount or when addressId changes
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const res = await fetch('https://api.sareh-nomow.xyz/api/addresses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          console.error('Failed to fetch addresses');
          return;
        }
        const data = await res.json();
        const transformed: Address[] = data.map((item: any) => ({
          id: item.id.toString(),
          street: item.address_1,
          city: item.city?.name || 'Unknown City',
          country: item.countries?.name || 'Unknown Country',
        }));
        setAddresses(transformed);

        if (addressId) {
          setSelectedAddressId(addressId.toString());
          const selected = transformed.find(addr => addr.id === addressId.toString());
          if (selected) {
            setCurrentAddress(`${selected.street}, ${selected.city}, ${selected.country}`);
          }
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      }
    };
    fetchAddresses();
  }, [addressId]);

  // When user selects an address, fetch shipping zones and update shipping cost & method
  const onSelectAddress = async (addr: Address) => {
    setSelectedAddressId(addr.id);
    setCurrentAddress(`${addr.street}, ${addr.city}, ${addr.country}`);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Use the selected address' country id or address id - adjust endpoint if needed
      const res = await fetch(`https://api.sareh-nomow.xyz/api/countries/${addr.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Shipping zones API error:', errorText);
        setShippingCost(0);
        setShippingMethodName('N/A');
        return;
      }

      const data = await res.json();

      if (data.zone_methods && data.zone_methods.length > 0) {
        const method = data.zone_methods[0];
        setShippingCost(parseFloat(method.cost) || 0);
        setShippingMethodName(method.method?.name || 'N/A');
      } else {
        setShippingCost(0);
        setShippingMethodName('N/A');
      }
    } catch (error) {
      console.error('Error fetching shipping method:', error);
      setShippingCost(0);
      setShippingMethodName('N/A');
    }
  };

  // Calculate totals
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const totalPrice = subtotal + shippingCost;

  const openPaymentMethodSheet = () => bottomSheetRef.current?.expand();
  const openConfirmationSheet = () => confirmationSheetRef.current?.expand();

  // Called when user picks a payment method
  const confirmPaymentMethod = (method: string) => {
    setPaymentMethod(method);
    bottomSheetRef.current?.close();
  };

  // Confirm payment: set shipping address & method, then show confirmation
  const confirmPayment = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token || !cartId || !selectedAddressId || !shippingZoneMethodId) {
        Alert.alert('Missing required information');
        return;
      }

      // 1. Set Shipping Address
      const addressResponse = await fetch(
        `https://api.sareh-nomow.xyz/api/carts/${cartId}/shipping-address/${selectedAddressId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!addressResponse.ok) {
        Alert.alert('Failed to set shipping address');
        return;
      }

      // 2. Set Shipping Method
      const methodResponse = await fetch(
        `https://api.sareh-nomow.xyz/api/carts/${cartId}/shipping-method/${shippingZoneMethodId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!methodResponse.ok) {
        Alert.alert('Failed to set shipping method');
        return;
      }

      openConfirmationSheet();
    } catch (error) {
      console.error('Error during payment confirmation:', error);
      Alert.alert('Error during payment confirmation, please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <Header title="Payment" showBack={true} showImage={false} />
      <ScrollView style={{ padding: 20 }}>
        <View style={styles.mapPreview}>
          <Text style={styles.title}>Choose an Address</Text>

          {addresses.length > 0 ? (
            <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 10 }}>
              {addresses.map(addr => (
                <TouchableOpacity
                  key={addr.id}
                  onPress={() => onSelectAddress(addr)}
                  style={{
                    padding: 10,
                    backgroundColor: addr.id === selectedAddressId ? '#d0f0c0' : '#f0f0f0',
                    borderRadius: 8,
                    marginBottom: 5,
                  }}
                >
                  <Text>{addr.street}, {addr.city}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={{ color: '#888' }}>No addresses found</Text>
          )}

          {selectedAddressId && (
            <View
              style={{
                marginTop: 10,
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Selected City</Text>
              <Text style={{ fontSize: 18, color: '#555' }}>
                {addresses.find(addr => addr.id === selectedAddressId)?.city || 'N/A'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate('AddressScreen')}
            style={{
              marginTop: 10,
              padding: 12,
              backgroundColor: '#000',
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create Address</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantity:</Text>
            <Text style={styles.summaryValue}>{totalQuantity}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping:</Text>
            <Text style={styles.summaryValue}>${shippingCost.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping Method:</Text>
            <Text style={styles.summaryValue}>{shippingMethodName || 'N/A'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total:</Text>
            <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.title}>Products</Text>
        {cartItems.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Image source={{ uri: item.image }} style={styles.itemImg} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text>{item.product_name}</Text>
              <Text>Qty: {item.qty}</Text>
            </View>
            <Text>${(item.product_price * item.qty).toFixed(2)}</Text>
          </View>
        ))}

        <Text style={styles.title}>Payment Method</Text>
        <TouchableOpacity style={styles.selectBtn} onPress={openPaymentMethodSheet}>
          <Text>{paymentMethod || 'Choose Payment Method'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmBtn} onPress={confirmPayment}>
          <Text style={styles.confirmText}>Confirm Payment</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Bottom Sheet */}
      <BottomSheet
        ref={confirmationSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <BottomSheetView style={{ alignItems: 'center', padding: 10 }}>
          <Image
            source={require('../assets/Maskgroup1.png')}
            style={{ height: 120, width: 120, borderRadius: 60 }}
          />
          <Text style={{ color: 'black', fontSize: 20, marginVertical: 10 }}>Order Successfully</Text>
          <CustomButton
            text="Order Tracking"
            onPress={() => navigation.navigate('MyOrders')}
          />
        </BottomSheetView>
      </BottomSheet>

      {/* Payment Method Selection Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <BottomSheetView style={{ padding: 20 }}>
          <TouchableOpacity onPress={() => confirmPaymentMethod('Cash')}>
            <Text style={styles.option}>Cash</Text>
          </TouchableOpacity>
          {/* Add more payment options here if needed */}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  title: { fontWeight: 'bold', fontSize: 16, marginVertical: 10 },
  mapPreview: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 10,
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
  },
  itemRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  itemImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  selectBtn: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    marginVertical: 10,
  },
  confirmBtn: {
    marginVertical: 15,
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  option: {
    fontSize: 18,
    paddingVertical: 12,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
});

export default PaymentScreen;

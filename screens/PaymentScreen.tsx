import React, {useState, useMemo, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import Header from '../components/Header';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getCartItems} from '../lib/api';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
import CustomInput from '../components/CustomInput';
import Icon from '../components/icon';
import {useTranslation} from 'react-i18next';
interface CartItem {
  product_price: number;
  qty: number;
  image: string;
  name: string;
  // Add more fields as needed
}
interface Address {
  id: string;
  street: string;
  city: string;
  country: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'PaymentScreen'>;
type RouteProps = RouteProp<RootStackParamList, 'PaymentScreen'>;

const PaymentScreen = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  // Extract params from route
  const {
    cartId,
    addressId,
    shippingCost: initialShippingCost = 0,
    shippingMethodName: initialShippingMethodName = '',
  } = route.params;
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null);

  const [shippingCost, setShippingCost] = useState<number>(initialShippingCost);

  const [error, setError] = useState('');
  console.log(error);

  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  console.log(currentAddress);
  const [loading, setLoading] = useState(false);

  const [shippingMethodName, setShippingMethodName] = useState<string>(
    initialShippingMethodName,
  );

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    addressId ? addressId.toString() : null,
  );

  const bottomSheetRef = useRef<BottomSheet>(null); // Payment method selection sheet
  const confirmationSheetRef = useRef<BottomSheet>(null); // Order confirmation sheet
  const [couponCode, setCouponCode] = useState('');

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
          const total = cart.items.reduce(
            (acc: number, item: {product_price: number; qty: number}) =>
              acc + item.product_price * item.qty,
            0,
          );
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
          headers: {Authorization: `Bearer ${token}`},
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
          const selected = transformed.find(
            addr => addr.id === addressId.toString(),
          );
          if (selected) {
            setCurrentAddress(
              `${selected.street}, ${selected.city}, ${selected.country}`,
            );
          }
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      }
    };
    fetchAddresses();
  }, [addressId]);
  useEffect(() => {
    const persistCartId = async () => {
      if (cartId) {
        await AsyncStorage.setItem('cartId', cartId.toString());
        console.log('Saved cartId to storage:', cartId);
      }
    };
    persistCartId();
  }, [cartId]);

  // When user selects an address, fetch shipping zones and update shipping cost & method
  const onSelectAddress = async (addr: Address) => {
    setSelectedAddressId(addr.id);
    setCurrentAddress(`${addr.street}, ${addr.city}, ${addr.country}`);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(
        `https://api.sareh-nomow.xyz/api/countries/${addr.id}`,
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Shipping zones API error:', errorText);
        setShippingCost(0); // Fixed
        setShippingMethodName('N/A');
        return;
      }

      const data = await res.json();
      console.log('Shipping zone methods:', data.zone_methods);

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
  const getEffectiveCartId = async () => {
    if (cartId) return cartId;

    const storedCartId = await AsyncStorage.getItem('cartId');
    return storedCartId || null;
  };

  // Called when user picks a payment method
  const confirmPaymentMethod = (method: string) => {
    setPaymentMethod(method);
    bottomSheetRef.current?.close();
  };
  const confirmPayment = async () => {
    console.log('Confirm Payment Pressed');

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token');
      console.log('Retrieved token:', token);
      if (!token) throw new Error('User not authenticated');

      const finalCartId = await getEffectiveCartId();
      console.log('Retrieved finalCartId:', finalCartId);
      if (!finalCartId) throw new Error('Cart ID not found');

      const requestBody = {
        cartId: Number(finalCartId), // 👈 cast to number
        paymentMethod: 'cash_on_delivery',
      };
      console.log('Request body:', requestBody);

      const response = await fetch('https://api.sareh-nomow.xyz/api/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Order confirmation failed:', errorText);
        throw new Error(errorText || 'Order confirmation failed');
      }

      const data = await response.json();
      console.log('Order confirmed:', data);

      navigation.navigate('MyOrders');
    } catch (err: any) {
      console.error('Error confirming payment:', err.message);
      setError(err.message || 'Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    console.log('Apply Coupon Pressed');

    if (!cartId) {
      const errMsg =
        'No active cart found. Please add items to your cart first.';
      console.warn(errMsg);
      setError(errMsg);
      return;
    }

    if (!couponCode.trim()) {
      const errMsg = 'Please enter a coupon code';
      console.warn(errMsg);
      setError(errMsg);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);
      if (!token) throw new Error('User not authenticated');

      console.log('Sending apply coupon request...');
      const applyResponse = await fetch(
        'https://api.sareh-nomow.xyz/api/coupons/apply',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            couponCode: couponCode.trim(),
            cartId,
          }),
        },
      );

      console.log('Apply response status:', applyResponse.status);

      if (!applyResponse.ok) {
        const errorText = await applyResponse.text();
        console.error('Failed to apply coupon:', errorText);
        throw new Error(errorText || 'Failed to apply coupon');
      }

      console.log('Fetching updated cart...');
      const cartResponse = await fetch(
        'https://api.sareh-nomow.xyz/api/carts/customer',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Cart fetch status:', cartResponse.status);

      if (!cartResponse.ok) {
        const errorText = await cartResponse.text();
        console.error('Error fetching updated cart:', errorText);
        throw new Error('Failed to fetch updated cart');
      }

      const cartData = await cartResponse.json();
      console.log('Updated cart data:', cartData);

      if (cartData.grand_total !== undefined) {
        console.log('Setting discounted total:', cartData.grand_total);
        setDiscountedTotal(cartData.grand_total);
      } else {
        console.error('grand_total not found in cart response');
        throw new Error('grand_total not found in cart response');
      }
    } catch (err: any) {
      console.error('Coupon error:', err.message);
      setError(err.message || 'Failed to apply coupon');
      setDiscountedTotal(null);
    } finally {
      console.log('Finished coupon request');
      setLoading(false);
    }
  };
  const deleteAddress = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const res = await fetch(
        `https://api.sareh-nomow.xyz/api/addresses/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      console.log(`DELETE address response status: ${res.status}`);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to delete address:', errorText);
        return;
      }

      console.log(`Address ${id} successfully deleted.`);

      // Refresh the list of addresses
      setAddresses(prev => prev.filter(addr => addr.id !== id));
    } catch (err: any) {
      console.error('Delete address error:', err.message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#F9F9F9',
      }}>
      <Header
        title={t('PaymentScreen.payment')}
        showBack={true}
        showImage={false}
      />
      <ScrollView style={{padding: 20, direction: isRTL ? 'rtl' : 'ltr'}}>
        <View style={styles.mapPreview}>
          <Text style={styles.title}>
            {t('PaymentScreen.Choose an Address')}
          </Text>

          {addresses.length > 0 ? (
            <View
              style={{backgroundColor: '#fff', borderRadius: 10, padding: 10}}>
              {addresses.map(addr => (
                <TouchableOpacity
                  key={addr.id}
                  onPress={() => onSelectAddress(addr)}
                  style={{
                    padding: 10,
                    backgroundColor:
                      addr.id === selectedAddressId ? '#d0f0c0' : '#f0f0f0',
                    borderRadius: 8,
                    marginBottom: 5,
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <Text style={{flex: 1}}>
                      {addr.street}, {addr.city}, {addr.country}
                    </Text>
                    <View style={{flexDirection: 'row'}}>
                      <TouchableOpacity
                        onPress={() => {
                          if (selectedAddressId !== null) {
                            navigation.navigate('EditAddressScreen', {
                              addressId: Number(selectedAddressId),
                            });
                          }
                        }}
                        style={{marginHorizontal: 5}}>
                        <Icon
                          type={'Ionicons'}
                          name="create-outline"
                          size={20}
                          color="#007bff"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => deleteAddress(addr.id)}>
                        <Icon
                          type={'Ionicons'}
                          name="trash"
                          size={20}
                          color="red"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={{color: '#888'}}>
              {t('PaymentScreen.No addresses found')}
            </Text>
          )}

          {selectedAddressId && (
            <View
              style={{
                marginTop: 10,
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: 10,
                alignItems: 'center',
              }}>
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                {t('PaymentScreen.Selected City')}
              </Text>
              <Text style={{fontSize: 18, color: '#555'}}>
                {addresses.find(addr => addr.id === selectedAddressId)?.city ||
                  'N/A'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => navigation.navigate('AddressScreen')}
            style={{
              marginTop: 10,
              padding: 12,
              backgroundColor: 'purple',
              borderRadius: 8,
              alignItems: 'center',
            }}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>
              {t('PaymentScreen.Create Address')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t('PaymentScreen.subtotal')}
            </Text>
            <Text style={styles.summaryValue}>
              ${subtotal ? subtotal.toFixed(2) : '0.00'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t('PaymentScreen.Quantity')}
            </Text>
            <Text style={styles.summaryValue}>
              {typeof totalQuantity === 'number' ? totalQuantity : 0}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t('PaymentScreen.Shipping')}
            </Text>
            <Text style={styles.summaryValue}>
              ${shippingCost ? shippingCost.toFixed(2) : '0.00'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t('PaymentScreen.Shipping Method')}
            </Text>
            <Text style={styles.summaryValue}>
              {shippingMethodName || t('PaymentScreen.not_selected')}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {color: 'gray'}]}>
              {t('PaymentScreen.Total')}
            </Text>
            <Text style={[styles.summaryValue, {color: 'gray'}]}>
              ${totalPrice ? totalPrice.toFixed(2) : '0.00'}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, {fontWeight: 'bold'}]}>
              {t('PaymentScreen.Total After Discount')}
            </Text>
            <Text style={[styles.summaryValue, {fontWeight: 'bold'}]}>
              ${discountedTotal ? discountedTotal.toFixed(2) : '0.00'}
            </Text>
          </View>
        </View>

        <CustomInput
          placeholder={t('PaymentScreen.enter_promo_code')}
          iconType="MaterialCommunityIcons"
          iconName="brightness-percent"
          value={couponCode}
          onChangeText={setCouponCode}
        />
        <View style={{width: '100%', alignItems: 'center'}}>
          <CustomButton
            text={
              loading
                ? t('PaymentScreen.applying')
                : t('PaymentScreen.apply promo')
            }
            onPress={handleApplyCoupon}
            disabled={loading}
          />
        </View>
        <Text style={styles.title}>{t('PaymentScreen.Products')}</Text>
        {cartItems.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Image source={{uri: item.image}} style={styles.itemImg} />
            <View style={{flex: 1, marginLeft: 10}}>
              <Text>{item.name}</Text>
              <Text>Qty: {item.qty}</Text>
            </View>
            <Text>${(item.product_price * item.qty).toFixed(2)}</Text>
          </View>
        ))}

        <Text style={styles.title}>{t('PaymentScreen.Payment Method')}</Text>
        <TouchableOpacity
          style={styles.selectBtn}
          onPress={openPaymentMethodSheet}>
          <Text>{paymentMethod || t('choose payment method')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmBtn} onPress={confirmPayment}>
          <Text style={styles.confirmText}>
            {t('PaymentScreen.Confirm Payment')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Bottom Sheet */}
      <BottomSheet
        ref={confirmationSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{alignItems: 'center', padding: 10}}>
          <Image
            source={require('../assets/Maskgroup1.png')}
            style={{height: 120, width: 120, borderRadius: 60}}
          />
          <Text style={{color: 'black', fontSize: 20, marginVertical: 10}}>
            {t('PaymentScreen.Order Successfully')}
          </Text>
          <CustomButton
            text={t('PaymentScreen.Order Tracking')}
            onPress={() => navigation.navigate('MyOrders')}
          />
        </BottomSheetView>
      </BottomSheet>

      {/* Payment Method Selection Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{padding: 20}}>
          <TouchableOpacity onPress={() => confirmPaymentMethod('Cash')}>
            <Text style={styles.option}>{t('PaymentScreen.Cash')}</Text>
          </TouchableOpacity>
          {/* Add more payment options here if needed */}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {fontWeight: 'bold', fontSize: 16, marginVertical: 10},
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
    backgroundColor: 'purple',
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

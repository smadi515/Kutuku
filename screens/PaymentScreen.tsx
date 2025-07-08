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
import Toast from 'react-native-toast-message';
import { useCurrency } from '../contexts/CurrencyContext';
import LinearGradient from 'react-native-linear-gradient';
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
  fullAddress: string;
  shippingMethods: {
    name: string;
    cost: number;
    shipping_zone_method_id: number;
  }[];
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'PaymentScreen'>;
type RouteProps = RouteProp<RootStackParamList, 'PaymentScreen'>;

const PaymentScreen = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { currency, rate } = useCurrency();

  const {
    cartId,
    addressId,
    shippingZoneMethodId,
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
  const [selectedShippingMethodId, setSelectedShippingMethodId] = useState<
    number | null
  >(shippingZoneMethodId || null);
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
          fullAddress: `${item.address_1}, ${item.city?.name}, ${item.countries?.name}`,
          shippingMethods:
            item.countries?.ShippingZone?.[0]?.zone_methods?.map(
              (method: any) => ({
                name: method.method?.name,
                cost: method.cost,
                shipping_zone_method_id: method.shipping_zone_method_id, // ✅ Add this
              }),
            ) || [],
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
  const onSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setCurrentAddress(`${addr.street}, ${addr.city}, ${addr.country}`);

    if (addr.shippingMethods.length > 0) {
      setShippingMethodName(addr.shippingMethods[0].name);
      setShippingCost(addr.shippingMethods[0].cost);

      // ✅ Save method ID (this assumes you're storing the ID in the shippingMethods array)
      if ('shipping_zone_method_id' in addr.shippingMethods[0]) {
        setSelectedShippingMethodId(
          (addr.shippingMethods[0] as any).shipping_zone_method_id,
        );
      }
    } else {
      setShippingMethodName('');
      setShippingCost(0);
      setSelectedShippingMethodId(null);
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

    // Validation for payment method and address
    if (!paymentMethod) {
      Toast.show({
        type: 'error',
        text1: 'Missing Payment Method',
        text2: 'Please select a payment method before confirming.',
      });
      return;
    }
    if (!selectedAddressId) {
      Toast.show({
        type: 'error',
        text1: 'Missing Address',
        text2: 'Please select a shipping address before confirming.',
      });
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated');
      }

      const finalCartId = await getEffectiveCartId();
      if (!finalCartId) {
        throw new Error('Cart ID not found');
      }

      // ✅ Step 1: Attach address to cart
      const finalAddressId = selectedAddressId || addressId;
      if (!finalAddressId) {
        throw new Error('Shipping address is missing.');
      }
      console.log('finalAddressId', finalAddressId);

      const addressRes = await fetch(
        `https://api.sareh-nomow.xyz/api/carts/${finalCartId}/shipping-address/${finalAddressId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!addressRes.ok) {
        const errorText = await addressRes.text();
        throw new Error(errorText || 'Failed to attach address to cart');
      }

      // ✅ Step 2: Attach shipping method to cart
      const finalShippingMethodId =
        selectedShippingMethodId || shippingZoneMethodId;
      if (!finalShippingMethodId) {
        throw new Error('Shipping method is missing.');
      }

      const methodRes = await fetch(
        `https://api.sareh-nomow.xyz/api/carts/${finalCartId}/shipping-method/${finalShippingMethodId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!methodRes.ok) {
        const errorText = await methodRes.text();
        throw new Error(
          errorText || 'Failed to attach shipping method to cart',
        );
      }

      // ✅ Step 3: Place the order
      const requestBody = {
        cartId: Number(finalCartId),
        paymentMethod: 'cash_on_delivery',
      };

      const response = await fetch('https://api.sareh-nomow.xyz/api/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Order confirmation failed');
      }

      const data = await response.json();
      console.log('Order confirmed:', data);

      Toast.show({
        type: 'success',
        text1: 'Order Confirmed',
        text2: 'Your order has been placed successfully!',
      });

      navigation.reset({
        index: 0,
        routes: [{name: 'TabNavigationScreen'}],
      });
    } catch (err: any) {
      console.error('Error confirming payment:', err.message);

      Toast.show({
        type: 'error',
        text1: 'Payment Error',
        text2: err.message || 'Failed to confirm payment',
      });

      setError(err.message || 'Failed to confirm payment');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    console.log('Apply Coupon Pressed');

    if (!couponCode.trim()) {
      const errMsg = 'Please enter a coupon code';
      console.warn(errMsg);
      setError(errMsg);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errMsg,
      });
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const payload = {
        couponCode: couponCode.trim(),
      };

      const applyResponse = await fetch(
        'https://api.sareh-nomow.xyz/api/coupons/apply',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (!applyResponse.ok) {
        const errorText = await applyResponse.text();
        throw new Error(errorText || 'Failed to apply coupon');
      }

      // Fetch updated cart
      const cartResponse = await fetch(
        'https://api.sareh-nomow.xyz/api/carts/customer',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!cartResponse.ok) {
        throw new Error('Failed to fetch updated cart');
      }

      const cartData = await cartResponse.json();

      if (cartData.grand_total !== undefined) {
        setDiscountedTotal(cartData.grand_total);

        Toast.show({
          type: 'success',
          text1: 'Coupon Applied',
          text2: 'Discount applied successfully!',
        });
      } else {
        throw new Error('grand_total not found in cart response');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to apply coupon';
      setError(errorMessage);
      setDiscountedTotal(null);

      Toast.show({
        type: 'error',
        text1: 'Coupon Error',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };
  const removeCoupon = async () => {
    if (!cartId || !couponCode.trim) {
      setError('Missing cart or coupon ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const payload = {
        cartId: cartId,
      };
      console.log('Removing coupon with payload:', payload);

      const response = await fetch(
        'https://api.sareh-nomow.xyz/api/coupons/remove',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to remove coupon');
      }

      setDiscountedTotal(null);
      setError('');
      setCouponCode('');
      console.log('Coupon removed successfully');
    } catch (err: any) {
      setError(err.message || 'Error removing coupon');
    } finally {
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
        backgroundColor: '#F5F0FF',
        paddingTop: 15,
      }}>
      <Header
        title={t('PaymentScreen.payment')}
        showBack={true}
        showImage={false}
      />
      <ScrollView style={{padding: 20, direction: isRTL ? 'rtl' : 'ltr'}} contentContainerStyle={{paddingBottom: 60}}>
        <View style={styles.mapPreviewCard}>
          <Text style={styles.title}>{t('PaymentScreen.Choose an Address')}</Text>
          {addresses.length > 0 ? (
            <View>
              {addresses.map(addr => (
                <TouchableOpacity
                  key={addr.id}
                  onPress={() => onSelectAddress(addr)}
                  style={[
                    styles.addressCard,
                    addr.id === selectedAddressId && styles.addressCardSelected,
                  ]}>
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={styles.addressText} numberOfLines={2}>
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
                        <Icon type={'Ionicons'} name="create-outline" size={20} color="#7B2FF2" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteAddress(addr.id)}>
                        <Icon type={'Ionicons'} name="trash" size={20} color="#F357A8" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={{color: '#888'}}>{t('PaymentScreen.No addresses found')}</Text>
          )}
          <TouchableOpacity
            onPress={() => navigation.navigate('AddressScreen')}
            style={styles.addAddressBtn}>
            <Text style={styles.addAddressBtnText}>{t('PaymentScreen.Create Address')}</Text>
          </TouchableOpacity>
        </View>
        {selectedAddressId && (
          <View style={styles.shippingCard}>
            <Text style={styles.title}>{t('PaymentScreen.Delivery Company')}</Text>
            {addresses.find(addr => addr.id === selectedAddressId)?.shippingMethods.map(method => (
              <TouchableOpacity
                key={method.name}
                style={[
                  styles.shippingMethodBtn,
                  method.name === shippingMethodName && styles.shippingMethodBtnSelected,
                ]}
                onPress={() => {
                  setShippingMethodName(method.name);
                  setShippingCost(method.cost);
                }}>
                <Text style={styles.shippingMethodText}>{`${method.name} - ${currency} ${(method.cost * rate).toFixed(2)}`}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <LinearGradient colors={["#7B2FF2", "#F357A8"]} style={styles.summaryGradient}>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('PaymentScreen.subtotal')}</Text>
              <Text style={styles.summaryValue}>{currency} {(subtotal * rate).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('PaymentScreen.Quantity')}</Text>
              <Text style={styles.summaryValue}>{typeof totalQuantity === 'number' ? totalQuantity : 0}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('PaymentScreen.Shipping')}</Text>
              <Text style={styles.summaryValue}>{currency} {(shippingCost * rate).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('PaymentScreen.Shipping Method')}</Text>
              <Text style={styles.summaryValue}>{shippingMethodName || t('PaymentScreen.not_selected')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, {color: '#fff'}]}>{t('PaymentScreen.Total')}</Text>
              <Text style={[styles.summaryValue, {color: '#fff'}]}>{currency} {(totalPrice * rate).toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, {fontWeight: 'bold', color: '#fff'}]}>{t('PaymentScreen.Total After Discount')}</Text>
              <Text style={[styles.summaryValue, {fontWeight: 'bold', color: '#fff'}]}>{currency} {(discountedTotal ? discountedTotal * rate : 0).toFixed(2)}</Text>
            </View>
          </View>
        </LinearGradient>
        <CustomInput
          placeholder={t('PaymentScreen.enter_promo_code')}
          iconType="MaterialCommunityIcons"
          iconName="brightness-percent"
          rightIconType="MaterialIcons"
          rightIconName={couponCode.trim() ? 'close' : undefined}
          onRightIconPress={removeCoupon}
          value={couponCode}
          onChangeText={setCouponCode}
        />
        <View style={{width: '100%', alignItems: 'center'}}>
          <CustomButton
            text={loading ? t('PaymentScreen.applying') : t('PaymentScreen.apply promo')}
            onPress={handleApplyCoupon}
            disabled={loading}
          />
        </View>
        <Text style={styles.title}>{t('PaymentScreen.Products')}</Text>
        {cartItems.map((item, index) => (
          <View key={index} style={styles.productCard}>
            <Image source={{uri: item.image}} style={styles.itemImg} />
            <View style={{flex: 1, marginLeft: 10}}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productQty}>Qty: {item.qty}</Text>
            </View>
            <Text style={styles.productPrice}>{currency} {(item.product_price * item.qty * rate).toFixed(2)}</Text>
          </View>
        ))}
        <Text style={styles.title}>{t('PaymentScreen.Payment Method')}</Text>
        <TouchableOpacity style={styles.paymentMethodBtn} onPress={openPaymentMethodSheet}>
          <Text style={styles.paymentMethodText}>{paymentMethod || t('choose payment method')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmBtnGradient} onPress={confirmPayment}>
          <LinearGradient colors={["#7B2FF2", "#F357A8"]} style={styles.confirmBtnGradientInner}>
            <Text style={styles.confirmText}>{t('PaymentScreen.Confirm Payment')}</Text>
          </LinearGradient>
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
  mapPreviewCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 18,
    marginBottom: 18,
    elevation: 4,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.09,
    shadowRadius: 10,
  },
  addressCard: {
    backgroundColor: '#F7F0FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#F7F0FF',
  },
  addressCardSelected: {
    borderColor: '#7B2FF2',
    backgroundColor: '#E9D7FF',
  },
  addressText: {fontSize: 15, color: '#333', fontWeight: '600'},
  addAddressBtn: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#7B2FF2',
    borderRadius: 10,
    alignItems: 'center',
  },
  addAddressBtnText: {color: '#fff', fontWeight: 'bold', fontSize: 15},
  shippingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    elevation: 3,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  shippingMethodBtn: {
    backgroundColor: '#F7F0FF',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#F7F0FF',
  },
  shippingMethodBtnSelected: {
    borderColor: '#7B2FF2',
    backgroundColor: '#E9D7FF',
  },
  shippingMethodText: {fontSize: 15, color: '#7B2FF2', fontWeight: '600'},
  summaryGradient: {
    borderRadius: 18,
    marginBottom: 18,
    elevation: 6,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.09,
    shadowRadius: 14,
  },
  summaryContainer: {
    backgroundColor: 'transparent',
    padding: 18,
    borderRadius: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: '#fff',
  },
  summaryValue: {
    fontSize: 16,
    color: '#fff',
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
    display: 'none',
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
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 7,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  productName: {fontWeight: '700', fontSize: 15, color: '#222'},
  productQty: {fontSize: 13, color: '#888'},
  productPrice: {fontWeight: 'bold', color: '#7B2FF2', fontSize: 15},
  paymentMethodBtn: {
    backgroundColor: '#F7F0FF',
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 12,
    alignSelf: 'flex-start',
  },
  paymentMethodText: {color: '#7B2FF2', fontWeight: '700', fontSize: 16},
  confirmBtnGradient: {
    marginTop: 18,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#F357A8',
    shadowOpacity: 0.13,
    shadowRadius: 8,
  },
  confirmBtnGradientInner: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 22,
  },
});

export default PaymentScreen;

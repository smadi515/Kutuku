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
import {useNavigation} from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getCartItems} from '../lib/api'; // ✅ use your API method
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../App';
const PaymentScreen = () => {
  type NavigationProp = StackNavigationProp<RootStackParamList>;
  const navigation = useNavigation<NavigationProp>();

  const [paymentMethod, setPaymentMethod] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [currentAddress, _setCurrentAddress] = useState<string>('');

  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetReff = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [250], []);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;

        const cart = await getCartItems(token);
        if (cart && cart.items) {
          setCartItems(cart.items);
          const total = cart.items.reduce(
            (acc: number, item: any) => acc + item.product_price * item.qty,
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

  const totalQuantity = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const openBottomSheet = () => bottomSheetRef.current?.expand();
  const openSheet = () => bottomSheetReff.current?.expand();

  const confirmPaymentMethod = (method: string) => {
    setPaymentMethod(method);
    bottomSheetRef.current?.close();
  };

  return (
    <View style={{flex: 1, backgroundColor: '#F9F9F9'}}>
      <Header title="Payment" showBack={true} showImage={false} />
      <ScrollView style={{padding: 20}}>
        <Text style={styles.title}>Shipping Address</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddressScreen')}>
          <View style={styles.mapPreview}>
            <Text style={styles.mapText}>
              {currentAddress || 'Select address '}
            </Text>
          </View>
        </TouchableOpacity>

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
            <Text style={styles.summaryLabel}>Delivery Price:</Text>
            <Text style={[styles.summaryValue, {fontStyle: 'italic'}]}>
              (Delivery price will be here)
            </Text>
          </View>
        </View>

        <Text style={styles.title}>Products</Text>
        {cartItems.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Image source={{uri: item.image}} style={styles.itemImg} />
            <View style={{flex: 1, marginLeft: 10}}>
              <Text>{item.product_name}</Text>
              <Text>Qty: {item.qty}</Text>
            </View>
            <Text>${(item.product_price * item.qty).toFixed(2)}</Text>
          </View>
        ))}

        <Text style={styles.title}>Payment Method</Text>
        <TouchableOpacity style={styles.selectBtn} onPress={openBottomSheet}>
          <Text>{paymentMethod || 'Choose Payment Method'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmBtn} onPress={openSheet}>
          <Text style={styles.confirmText}>Confirm Payment</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Order Confirmation */}
      <BottomSheet
        ref={bottomSheetReff}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{alignItems: 'center', padding: 10}}>
          <Image
            source={require('../assets/Maskgroup1.png')}
            style={{height: 120, width: 120, borderRadius: 60}}
          />
          <Text style={{color: 'black', fontSize: 20}}>Order Successfully</Text>
          <CustomButton
            text="Order Tracking"
            onPress={() => navigation.navigate('MyOrders')}
          />
        </BottomSheetView>
      </BottomSheet>

      {/* Payment Method */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{padding: 20}}>
          <TouchableOpacity onPress={() => confirmPaymentMethod('Cash')}>
            <Text style={styles.option}>Cash</Text>
          </TouchableOpacity>
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
  mapText: {color: '#333'},
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
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
  },
  itemImg: {width: 50, height: 50, borderRadius: 6},
  selectBtn: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: 10,
  },
  confirmBtn: {
    backgroundColor: '#000',
    padding: 14,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  confirmText: {color: '#fff', fontWeight: 'bold'},
  option: {
    fontSize: 16,
    paddingVertical: 10,
  },
});

export default PaymentScreen;

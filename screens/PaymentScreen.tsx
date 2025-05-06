import React, {useState, useMemo, useRef} from 'react';
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
import {useRoute, useNavigation, RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../App';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import CustomButton from '../components/CustomButton';

const PaymentScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 👇 Correct route with proper screen
  const route = useRoute<RouteProp<RootStackParamList, 'PaymentScreen'>>();

  const {
    selectedItems,
    subtotal,
    total,
    address: incomingAddress = '',
  } = route.params;

  const [currentAddress, setCurrentAddress] = useState(incomingAddress || '');
  const [paymentMethod, setPaymentMethod] = useState('');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetReff = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [250], []);

  const openAddressScreen = () => {
    navigation.navigate('AddressScreen', {
      selectedItems,
      subtotal,
      total,
      address: currentAddress,
    });
  };
  const openBottomSheet = () => {
    bottomSheetRef.current?.expand();
  };
  const openSheet = () => {
    bottomSheetReff.current?.expand();
  };

  const confirmPaymentMethod = (method: string) => {
    setPaymentMethod(method);
    bottomSheetRef.current?.close();
  };
  console.log(setCurrentAddress, 'senand');

  return (
    <View style={{flex: 1, backgroundColor: '#F9F9F9'}}>
      <Header title="Payment" showBack={true} showImage={false} />
      <ScrollView style={{padding: 20}}>
        <Text style={styles.title}>Shipping Address</Text>
        <TouchableOpacity onPress={openAddressScreen}>
          <View style={styles.mapPreview}>
            <Text style={styles.mapText}>
              {currentAddress || 'Select address on map'}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.title}>Products</Text>
        {selectedItems.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Image source={item.image} style={styles.itemImg} />
            <View style={{flex: 1, marginLeft: 10}}>
              <Text>{item.title}</Text>
              <Text>Qty: {item.quantity}</Text>
            </View>
            <Text>${(item.price * item.quantity).toFixed(2)}</Text>
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
      <BottomSheet ref={bottomSheetReff} index={-1} snapPoints={snapPoints}>
        <BottomSheetView
          style={{
            alignItems: 'center',
            padding: 10,
          }}>
          <Image
            source={require('../assets/Maskgroup1.png')}
            style={{height: 120, width: 120, borderRadius: 60}}
          />
          <Text style={{color: 'black', fontSize: 20}}>Order Successfully</Text>
          <Text style={{color: 'gray'}}>
            senan nidal mohammed al smadi its big problem
          </Text>
          <Text style={{color: 'gray'}}>
            senan nidal mohammed al smadi its big problem
          </Text>

          <CustomButton
            text="Order Tracking"
            onPress={() => {
              navigation.navigate('MyOrders', {
                newOrder: {
                  items: selectedItems,
                  address: currentAddress,
                  paymentMethod,
                  total,
                  status: 'On Progress',
                },
              });
            }}
          />
        </BottomSheetView>
      </BottomSheet>
      <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={snapPoints}>
        <BottomSheetView style={{padding: 20}}>
          <TouchableOpacity onPress={() => confirmPaymentMethod('PayPal')}>
            <Text style={styles.option}>PayPal</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmPaymentMethod('Visa')}>
            <Text style={styles.option}>Visa</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmPaymentMethod('MasterCard')}>
            <Text style={styles.option}>MasterCard</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmPaymentMethod('Custom')}>
            <Text style={[styles.option, {color: 'blue'}]}>
              Create Payment Method
            </Text>
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

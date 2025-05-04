// screens/CartScreen.tsx
import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../App';
import CustomInput from '../components/CustomInput';
type ColorOption = {
  color: string; // color code or name
  image: any; // the image associated with this color option
};
type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  selected: boolean;
  image: any;
  selectedColor?: ColorOption; // Add selectedColor here
};
const SHIPPING_COST = 6;
const CartScreen = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [450], []);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    const storedCart = await AsyncStorage.getItem('cart');
    const items = storedCart ? JSON.parse(storedCart) : [];
    setCartItems(items);
  };

  const updateCart = async (updatedCart: any[]) => {
    setCartItems(updatedCart);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const increaseQty = (id: string) => {
    const updated = cartItems.map(item =>
      item.id === id ? {...item, quantity: item.quantity + 1} : item,
    );
    updateCart(updated);
  };

  const decreaseQty = (id: string) => {
    const updated = cartItems
      .map(item =>
        item.id === id ? {...item, quantity: item.quantity - 1} : item,
      )
      .filter(item => item.quantity > 0);
    updateCart(updated);
  };

  const toggleSelect = (id: string) => {
    const updated = cartItems.map(item =>
      item.id === id ? {...item, selected: !item.selected} : item,
    );
    updateCart(updated);
  };

  const openSummary = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };
  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const total = subtotal + SHIPPING_COST;

  const goToPayment = () => {
    navigation.navigate('PaymentScreen', {selectedItems, subtotal, total});
  };

  const renderItem = ({item}: any) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleSelect(item.id)}>
        <View
          style={[
            styles.checkCircle,
            item.selected && {backgroundColor: '#000'},
          ]}
        />
      </TouchableOpacity>
      <Image source={item.image} style={styles.image} />
      <View style={{flex: 1, marginHorizontal: 10}}>
        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => decreaseQty(item.id)}
            style={styles.qtyBtn}>
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.qtyNum}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => increaseQty(item.id)}
            style={styles.qtyBtn}>
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
          <View style={{alignItems: 'flex-end', flex: 1}}>
            <Text style={styles.price}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="My Cart"
        showBack={true}
        showImage={false}
        rightIcons={[
          {
            name: 'cart-outline',
            type: 'Ionicons',
            onPress: () => navigation.navigate('CartScreen'),
          },
        ]}
      />

      <FlatList
        data={cartItems}
        keyExtractor={item =>
          `${item.id}-${item.selectedColor?.color || 'default'}`
        } // Unique key
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>Your cart is empty!</Text>
        }
      />
      {cartItems.length > 0 && (
        <Pressable style={styles.summaryBtn} onPress={openSummary}>
          <Text style={styles.summaryText}>View Summary</Text>
        </Pressable>
      )}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{padding: 20, flex: 1}}>
          <View style={styles.sheetContent}>
            <CustomInput
              placeholder="Enter your Promo Code"
              iconType="MaterialCommunityIcons"
              iconName="brightness-percent"
            />
            <Text>Subtotal: ${subtotal.toFixed(2)}</Text>
            <Text>Shipping: ${SHIPPING_COST}</Text>
            <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
            <TouchableOpacity style={styles.checkoutBtn} onPress={goToPayment}>
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F9F9F9'},
  empty: {textAlign: 'center', marginTop: 20, color: '#777'},
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  image: {width: 60, height: 60, borderRadius: 8},
  title: {fontWeight: 'bold', fontSize: 14},
  price: {color: 'black', marginTop: 2, fontSize: 20},
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  qtyText: {fontSize: 18},
  qtyNum: {marginHorizontal: 10},
  checkbox: {marginRight: 8},
  checkCircle: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
  },
  summaryBtn: {
    backgroundColor: '#000',
    padding: 12,
    alignItems: 'center',
    margin: 10,
    borderRadius: 10,
  },
  summaryText: {color: '#fff', fontWeight: 'bold'},
  sheetContent: {padding: 20},
  sheetTitle: {fontWeight: 'bold', fontSize: 16, marginBottom: 10},
  total: {marginTop: 10, fontWeight: 'bold'},
  checkoutBtn: {
    backgroundColor: '#000',
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutText: {color: '#fff', fontWeight: 'bold'},
});

export default CartScreen;

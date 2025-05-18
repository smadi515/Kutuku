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
import Icon from '../components/icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../App';
import CustomInput from '../components/CustomInput';
import {updateCartItemQuantity} from '../lib/api'; // Adjust the path as needed
import {getCustomerCart, deleteCartItem} from '../lib/api'; // assuming correct import
type CartItem = {
  cart_item_id: number;
  product_id: number;
  cart_id: number;
  quantity: number;
  [key: string]: any;
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

  const updateCart = async (updatedCart: CartItem[]) => {
    setCartItems(updatedCart);
    await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
  };
  // Delete function:
  const deleteItem = async (cart_item_id: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('❌ Missing token');
        return;
      }

      const cart = await getCustomerCart(token);
      const backendCartItems = cart?.items || [];
      const cartId = cart?.id || backendCartItems[0]?.cart_id;

      if (!cartId) {
        console.error('❌ No cart_id found');
        return;
      }

      // Find backend cart item with matching cart_item_id
      const backendItem = backendCartItems.find(
        (item: CartItem) => item.cart_item_id === cart_item_id,
      );

      if (!backendItem) {
        console.error('❌ Cart item not found for cart_item_id:', cart_item_id);
        return;
      }

      console.log(
        `🗑️ Deleting item cart_item_id: ${cart_item_id} from cart_id: ${cartId}`,
      );

      await deleteCartItem(token, cartId, cart_item_id);
      console.log('✅ Item deleted from backend');

      // Update local UI state and AsyncStorage
      const updatedItems = cartItems.filter(
        item => item.cart_item_id !== cart_item_id,
      );
      setCartItems(updatedItems);
      await AsyncStorage.setItem('cart', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('❌ Failed to delete item:', error);
    }
  };

  const increaseQty = async (itemId: string, color?: string) => {
    try {
      console.log(
        `🔄 Attempting to increase qty for itemId: ${itemId} Color: ${color}`,
      );

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('❌ Missing token');
        return;
      }

      const cart = await getCustomerCart(token);
      console.log('📦 Full cart response from backend: ', cart);

      const backendCartItems = cart?.items || [];
      const cartId = backendCartItems[0]?.cart_id;
      if (!cartId) {
        console.error('❌ No cart_id found');
        return;
      }

      await AsyncStorage.setItem('cartId', cartId.toString());
      console.log('✅ Saved cartId to AsyncStorage:', cartId);

      // 🔍 Find matching item from backend cart
      const backendItem = backendCartItems.find(
        (item: CartItem) => item.product_id === Number(itemId),
      );

      if (!backendItem) {
        console.error('❌ Cart item not found for product:', itemId);
        return;
      }

      const cartItemId = backendItem.cart_item_id;
      const newQuantity = backendItem.qty + 1;
      console.log(
        `🆙 Increasing quantity for cart_item_id ${cartItemId} to ${newQuantity}`,
      );
      console.log(
        `🛒 Updating backend cart - cart_id: ${cartId}, cart_item_id: ${cartItemId}, qty: ${newQuantity}`,
      );

      await updateCartItemQuantity(token, cartItemId, cartId, newQuantity);
      console.log('✅ Quantity updated on backend');

      // Update local UI state
      const updatedItems = cartItems.map((item: CartItem) =>
        item.product_id === Number(itemId)
          ? {...item, qty: newQuantity, quantity: newQuantity}
          : item,
      );

      await updateCart(updatedItems);
    } catch (error) {
      console.error('❌ Failed to increase quantity:', error);
    }
  };

  const decreaseQty = async (itemId: string, color?: string) => {
    try {
      console.log(
        `🔄 Attempting to decrease qty for itemId: ${itemId} Color: ${color}`,
      );

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('❌ Missing token');
        return;
      }

      const cart = await getCustomerCart(token);
      console.log('📦 Full cart response from backend: ', cart);

      const backendCartItems = cart?.items || [];
      const cartId = backendCartItems[0]?.cart_id;
      if (!cartId) {
        console.error('❌ No cart_id found');
        return;
      }

      await AsyncStorage.setItem('cartId', cartId.toString());
      console.log('✅ Saved cartId to AsyncStorage:', cartId);

      // Find matching item from backend cart by product_id
      const backendItem = backendCartItems.find(
        (item: CartItem) => item.product_id === Number(itemId),
      );

      if (!backendItem) {
        console.error('❌ Cart item not found for product:', itemId);
        return;
      }

      const cartItemId = backendItem.cart_item_id;
      const newQuantity = backendItem.qty - 1;

      if (newQuantity < 1) {
        // Delete item from backend
        console.log(
          `🗑️ Quantity is 0, deleting item cart_item_id: ${cartItemId} from backend and UI`,
        );
        await deleteItem(cartItemId);

        // Update UI: remove item from cartItems
        const updatedItems = cartItems.filter(
          (item: CartItem) => item.cart_item_id !== cartItemId,
        );

        await updateCart(updatedItems);
        return;
      }

      // Decrease qty on backend
      console.log(
        `🆙 Decreasing quantity for cart_item_id ${cartItemId} to ${newQuantity}`,
      );
      await updateCartItemQuantity(token, cartItemId, cartId, newQuantity);
      console.log('✅ Quantity updated on backend');

      // Update local UI state by cart_item_id
      const updatedItems = cartItems.map((item: CartItem) =>
        item.product_id === Number(itemId)
          ? {...item, qty: newQuantity, quantity: newQuantity}
          : item,
      );

      await updateCart(updatedItems);
    } catch (error) {
      console.error('❌ Failed to decrease quantity:', error);
    }
  };

  const toggleSelect = (id: string, color?: string) => {
    const updated = cartItems.map(item =>
      item.id === id && item.selectedColor?.color === color
        ? {...item, selected: !item.selected}
        : item,
    );
    updateCart(updated);
  };

  const openSummary = () => {
    bottomSheetRef.current?.snapToIndex(0);
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0,
  );
  const total = subtotal + SHIPPING_COST;

  const renderItem = ({item}: {item: CartItem}) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleSelect(item.id, item.selectedColor?.color)}>
        <View
          style={[
            styles.checkCircle,
            item.selected && {backgroundColor: 'purple'},
          ]}
        />
      </TouchableOpacity>
      <Image source={item.image} style={styles.image} />
      <View style={{flex: 1, marginHorizontal: 10}}>
        <Text style={styles.title}>{item.title}</Text>
        {item.selectedColor?.color && (
          <Text style={{fontSize: 12, color: '#555'}}>
            Color: {item.selectedColor.color}
          </Text>
        )}
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
          <TouchableOpacity
            onPress={() => deleteItem(item.id)}
            style={{marginLeft: 15}}>
            <Icon
              type={'Ionicons'}
              name="trash-outline"
              size={24}
              color="red"
            />
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
        }
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
  qtyNum: {
    marginHorizontal: 10,
    fontSize: 16,
    color: '#000', // ✅ make sure text color isn't white on white
  },
  checkbox: {marginRight: 8},
  checkCircle: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: 'purple',
    borderRadius: 10,
  },
  summaryBtn: {
    backgroundColor: 'purple',
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
    backgroundColor: 'purple',
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutText: {color: '#fff', fontWeight: 'bold'},
});

export default CartScreen;

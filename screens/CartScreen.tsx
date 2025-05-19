// CartScreen.tsx
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
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

import Icon from '../components/icon';
import Header from '../components/Header';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

import {
  deleteCartItem,
  updateCartItemQuantity,
  getProductById,
  getCustomerCart,
  applyCoupon,
} from '../lib/api';
import type {RootStackParamList} from '../App';

type CartItem = {
  cart_item_id: number;
  product_id: number;
  cart_id: number;
  price: number;
  qty: number;
  quantity: number;
  title: string;
  image?: {uri: string};
  selected?: boolean;
  selectedColor?: {color: string};
};

type ProductImage = {
  is_main: boolean;
  listing_image: string;
};

type CartApiItem = {
  cart_item_id: number;
  product_id: number;
  cart_id: number;
  qty: number;
  price?: number;
};

type ProductDescription = {
  name?: string;
  description?: string;
  short_description?: string;
};

const SHIPPING_COST = 6;

const CartScreen = () => {
  const [cartId, setCartId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountedTotal, setDiscountedTotal] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  console.log(navigation);

  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setCartItems([]);
        setCartId(null);
        return;
      }

      const cart = await getCustomerCart(token);
      console.log('Fetched Cart:', cart); // <-- DEBUG HERE

      if (!cart || !cart.items) {
        setCartItems([]);
        setCartId(null);
        return;
      }

      setCartId(cart.id || null);

      // Enrich cart items with product details
      const enrichedItems = await Promise.all(
        (cart.items as CartApiItem[]).map(async (item: CartApiItem) => {
          const product = await getProductById(item.product_id);
          const mainImage =
            product.images?.find((img: ProductImage) => img.is_main) ||
            product.images?.[0];

          let desc: ProductDescription = {};
          if (
            typeof product.description === 'object' &&
            product.description !== null
          ) {
            desc = product.description;
          }

          const quantity = item.qty ?? 1;

          return {
            cart_item_id: item.cart_item_id,
            product_id: item.product_id,
            cart_id: item.cart_id,
            qty: item.qty,
            quantity,
            price: item.price ?? product.price ?? 0,
            title: product.name || desc.name || 'No title',
            image: mainImage ? {uri: mainImage.listing_image} : undefined,
            selected: false,
            selectedColor: undefined,
          } as CartItem;
        }),
      );

      setCartItems(enrichedItems);
      setDiscountedTotal(null);
      setCouponCode('');
      setError('');
    } catch (err) {
      console.error('❌ Failed to load cart items:', err);
      setCartItems([]);
      setCartId(null);
    }
  };

  const updateItemQty = async (productId: number, change: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const item = cartItems.find(i => i.product_id === productId);
      if (!item) return;

      const newQty = (item.quantity || 0) + change;
      if (newQty < 1) {
        await deleteItem(item.cart_item_id);
        return;
      }

      await updateCartItemQuantity(
        token,
        item.cart_item_id,
        item.cart_id,
        newQty,
      );

      const updatedItems = cartItems.map(i =>
        i.product_id === productId ? {...i, quantity: newQty, qty: newQty} : i,
      );
      setCartItems(updatedItems);
    } catch (err) {
      console.error('❌ Failed to update item quantity:', err);
    }
  };

  const deleteItem = async (cart_item_id: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const item = cartItems.find(i => i.cart_item_id === cart_item_id);
      if (!item) return;

      await deleteCartItem(token, item.cart_id, cart_item_id);

      const updatedItems = cartItems.filter(
        i => i.cart_item_id !== cart_item_id,
      );
      setCartItems(updatedItems);
    } catch (err) {
      console.error('❌ Failed to delete item:', err);
    }
  };

  const toggleSelect = (cart_item_id: number) => {
    const updated = cartItems.map(item =>
      item.cart_item_id === cart_item_id
        ? {...item, selected: !item.selected}
        : item,
    );
    setCartItems(updated);
  };

  const openSummary = () => {
    bottomSheetRef.current?.expand();
  };

  const handleApplyCoupon = async () => {
    console.log(cartId, couponCode);

    if (!cartId) {
      setError('No active cart found. Please add items to your cart first.');
      return;
    }
    if (!couponCode.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await applyCoupon(cartId, couponCode.trim(), token);
      setDiscountedTotal(response.total ?? null);
      if (response.total === undefined) {
        setError('Invalid response from coupon API');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to apply coupon');
      setDiscountedTotal(null);
    } finally {
      setLoading(false);
    }
  };

  const selectedItems = cartItems.filter(item => item.selected);
  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0,
  );
  const total = subtotal + SHIPPING_COST;

  const renderItem = ({item}: {item: CartItem}) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleSelect(item.cart_item_id)}>
        <View
          style={[
            styles.checkCircle,
            item.selected && {backgroundColor: 'purple'},
          ]}
        />
      </TouchableOpacity>

      {item.image ? (
        <Image source={item.image} style={styles.image} />
      ) : (
        <View style={[styles.image, {backgroundColor: '#ccc'}]} />
      )}

      <View style={{flex: 1, marginHorizontal: 10}}>
        <Text style={styles.title}>{item.title}</Text>
        {item.selectedColor?.color && (
          <Text style={{fontSize: 12, color: '#555'}}>
            Color: {item.selectedColor.color}
          </Text>
        )}

        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => updateItemQty(item.product_id, -1)}
            style={styles.qtyBtn}>
            <Text style={styles.qtyText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.qtyNum}>{item.quantity}</Text>

          <TouchableOpacity
            onPress={() => updateItemQty(item.product_id, 1)}
            style={styles.qtyBtn}>
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => deleteItem(item.cart_item_id)}
            style={{marginLeft: 15}}>
            <Icon type="Ionicons" name="trash-outline" size={24} color="red" />
          </TouchableOpacity>

          <View style={{alignItems: 'flex-end', flex: 1}}>
            <Text style={styles.price}>
              ${(item.price * (item.quantity || 1)).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="My Cart" showBack showImage={false} rightIcons={[]} />

      <FlatList
        data={cartItems}
        keyExtractor={item => item.cart_item_id.toString()}
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
              value={couponCode}
              onChangeText={setCouponCode}
            />
            <View style={{width: '100%', alignItems: 'center'}}>
              <CustomButton
                text={loading ? 'Applying...' : 'Apply Promo'}
                onPress={handleApplyCoupon}
                disabled={loading}
              />
            </View>

            {error ? (
              <Text style={{color: 'red', marginTop: 6}}>{error}</Text>
            ) : null}

            <Text style={{marginTop: 12}}>
              Subtotal: ${subtotal.toFixed(2)}
            </Text>
            <Text>Shipping: ${SHIPPING_COST}</Text>

            {discountedTotal !== null ? (
              <>
                <Text
                  style={{textDecorationLine: 'line-through', color: 'gray'}}>
                  Total: ${total.toFixed(2)}
                </Text>
                <Text style={styles.total}>
                  Discounted Total: ${discountedTotal.toFixed(2)}
                </Text>
              </>
            ) : (
              <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
            )}
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
  qtyRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  qtyBtn: {
    width: 30,
    height: 30,
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  qtyText: {fontWeight: 'bold', fontSize: 20},
  qtyNum: {paddingHorizontal: 6, fontSize: 18},
  checkbox: {padding: 10},
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: 'gray',
    borderWidth: 2,
  },
  summaryBtn: {
    backgroundColor: 'purple',
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  summaryText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  sheetContent: {
    flex: 1,
  },
  total: {fontWeight: 'bold', fontSize: 20, marginTop: 6},
});

export default CartScreen;

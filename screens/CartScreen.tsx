// CartScreen.tsx
import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import Icon from '../components/icon';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';

import {
  deleteCartItem,
  updateCartItemQuantity,
  getCustomerCart,
} from '../lib/api';
import type {RootStackParamList} from '../App';
import {useTranslation} from 'react-i18next';

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
type CartApiItem = {
  cart_item_id: number;
  product_id: number;
  cart_id: number;
  qty: number;
  price?: number;

  product_name?: string;
  product_price?: number;
  image?: string;
  product?: {
    description?: {
      url_key?: string;
      name?: string;
      description?: string;
      short_description?: string;
    };
  };
};

const CartScreen = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [cartId, setCartId] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  console.log(navigation);

  const loadCartItems = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setCartItems([]);
        setCartId(null);
        return;
      }

      const cart = await getCustomerCart(token);
      console.log('Fetched Cart:', cart);

      if (!cart || !cart.items) {
        setCartItems([]);
        setCartId(cart?.cart_id || null);
        return;
      }

      setCartId(cart.cart_id || null);

      const enrichedItems = cart.items.map((item: CartApiItem) => {
        const quantity = item.qty ?? 1;
        const product = item.product || {};
        const description = product.description ?? {};
        const title = item.product_name || description.name || 'No title';

        return {
          cart_item_id: item.cart_item_id,
          product_id: item.product_id,
          cart_id: item.cart_id,
          qty: item.qty,
          quantity,
          price: item.product_price ?? 0,
          title,
          image: item.image ? {uri: item.image} : undefined,
          selected: false,
          selectedColor: undefined,
        } as CartItem;
      });

      setCartItems(enrichedItems);
    } catch (err) {
      console.error('❌ Failed to load cart items:', err);
      setCartItems([]);
      setCartId(null);
    }
  }, []);

  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);
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
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const renderItem = ({item}: {item: CartItem}) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => toggleSelect(item.cart_item_id)}>
        <View
          style={[
            styles.checkCircle,
            item.selected && {backgroundColor: 'purple'},
            {direction: isRTL ? 'rtl' : 'ltr'},
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
      <Header
        title={t('cart.title')}
        showBack
        showImage={false}
        rightIcons={[]}
      />

      <FlatList
        data={cartItems}
        keyExtractor={item => item.cart_item_id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>{t('cart.empty')}</Text>}
      />
      <View
        style={{
          paddingHorizontal: 15,
          paddingVertical: 10,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderColor: '#ddd',
        }}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>
            {t('cart.subtotal')}
          </Text>
          <Text style={{fontSize: 16, fontWeight: 'bold'}}>
            ${subtotal.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={{width: '100%', padding: 10, alignItems: 'center'}}>
        <CustomButton
          text={t('cart.checkout')}
          disabled={cartItems.length === 0}
          onPress={() => {
            if (!cartId) {
              Alert.alert(t('cart.noActiveCart'));
              return;
            }

            navigation.navigate('PaymentScreen', {cartId} as any);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F0FF', paddingTop: 10},
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
    width: '100%',
    height: 60,
    backgroundColor: 'purple',
    padding: 10,
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

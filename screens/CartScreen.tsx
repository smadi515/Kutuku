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
import LinearGradient from 'react-native-linear-gradient';

import {
  deleteCartItem,
  updateCartItemQuantity,
  getCustomerCart,
} from '../lib/api';
import type {RootStackParamList} from '../App';
import {useTranslation} from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext';

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
  const { currency, rate } = useCurrency();

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
    <View style={styles.itemCard}>
      <View style={styles.imageWrapper}>
        {item.image ? (
          <Image source={item.image} style={styles.image} />
        ) : (
          <View style={[styles.image, {backgroundColor: '#ccc'}]} />
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.title}>{item.title}</Text>
        {item.selectedColor?.color && (
          <Text style={styles.colorText}>Color: {item.selectedColor.color}</Text>
        )}
        <View style={styles.qtyRow}>
          <TouchableOpacity
            onPress={() => updateItemQty(item.product_id, -1)}
            style={styles.qtyBtn}>
            <Icon name="minus" type="ant" size={16} color="#7B2FF2" />
          </TouchableOpacity>
          <Text style={styles.qtyNum}>{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => updateItemQty(item.product_id, 1)}
            style={styles.qtyBtn}>
            <Icon name="plus" type="ant" size={16} color="#7B2FF2" />
          </TouchableOpacity>
        </View>
        <Text style={styles.price}>
          {currency} {(item.price * (item.quantity || 1) * rate).toFixed(2)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => deleteItem(item.cart_item_id)}
        style={styles.deleteBtn}>
        <Icon type="Ionicons" name="trash-outline" size={22} color="#F357A8" />
      </TouchableOpacity>
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
        contentContainerStyle={{padding: 12, paddingBottom: 120}}
      />
      <LinearGradient
        colors={["#7B2FF2", "#F357A8"]}
        style={styles.subtotalGradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      >
        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>{t('cart.subtotal')}</Text>
          <Text style={styles.subtotalValue}>{currency} {(subtotal * rate).toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, cartItems.length === 0 && {opacity: 0.5}]}
          disabled={cartItems.length === 0}
          onPress={() => {
            if (!cartId) {
              Alert.alert(t('cart.noActiveCart'));
              return;
            }
            navigation.navigate('PaymentScreen', {cartId} as any);
          }}
        >
          <Text style={styles.checkoutBtnText}>{t('cart.checkout')}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F0FF'},
  empty: {textAlign: 'center', marginTop: 20, color: '#777'},
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 18,
    borderRadius: 18,
    alignItems: 'center',
    padding: 14,
    elevation: 5,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.09,
    shadowRadius: 10,
    marginHorizontal: 2,
  },
  imageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 14,
    backgroundColor: '#f7f7fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  image: {width: 60, height: 60, borderRadius: 12},
  itemInfo: {flex: 1},
  title: {fontWeight: '700', fontSize: 16, color: '#222', marginBottom: 2},
  colorText: {fontSize: 12, color: '#7B2FF2', marginBottom: 2},
  price: {color: '#7B2FF2', marginTop: 8, fontSize: 18, fontWeight: 'bold'},
  qtyRow: {flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8},
  qtyBtn: {
    width: 32,
    height: 32,
    backgroundColor: '#F5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  qtyNum: {paddingHorizontal: 10, fontSize: 16, fontWeight: '600'},
  deleteBtn: {
    marginLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 7,
    elevation: 2,
    shadowColor: '#F357A8',
    shadowOpacity: 0.13,
    shadowRadius: 6,
  },
  subtotalGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.09,
    shadowRadius: 14,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  subtotalLabel: {fontSize: 18, color: '#fff', fontWeight: '700'},
  subtotalValue: {fontSize: 18, color: '#fff', fontWeight: '700'},
  checkoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
    elevation: 2,
    shadowColor: '#F357A8',
    shadowOpacity: 0.13,
    shadowRadius: 6,
  },
  checkoutBtnText: {
    color: '#7B2FF2',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default CartScreen;

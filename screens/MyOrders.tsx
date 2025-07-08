import React, {useEffect, useState, useCallback, useMemo, useRef} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from 'react-native';
import Header from '../components/Header';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { useCurrency } from '../contexts/CurrencyContext';
import Icon from '../components/icon';
import LinearGradient from 'react-native-linear-gradient';

const API_ORDERS_URL =
  'https://api.sareh-nomow.website/api/client/v1/orders/user';

type OrderItem = {
  product_name: string;
  qty: number;
  product_image: string;
  color?: string;
  product_id: number;
};

type Order = {
  items: OrderItem[];
  status?: string;
  order_number: string;
  product_price: number;
  payment_method_name?: string;
  shipping_method_name?: string;
};

const statusColors: Record<string, string> = {
  delivered: '#7B2FF2',
  pending: '#F357A8',
  cancelled: '#ccc',
  onProgress: '#FBBF24',
};

const MyOrders = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const { currency, rate } = useCurrency();

  const openOrderDetail = () => bottomSheetRef.current?.expand();
  const openOrderReview = () => bottomSheetRef.current?.expand();
  const handleSubmitReview = async () => {
    if (!selectedOrder || selectedOrder.items.length === 0) return;
    const productId = selectedOrder.items[0].product_id; // adjust if needed

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        'https://api.sareh-nomow.website/api/client/v1/reviews',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: productId,
            rating,
            review_text: reviewText,
          }),
        },
      );
      await response.json();
      bottomSheetRef.current?.close();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error(t('myorder.authError') || 'Authentication error');
      }
      const response = await fetch(API_ORDERS_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(t('myorder.fetchError'));
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error(t('myorder.invalidResponse') || 'Invalid response');
      }
      const formattedOrders: Order[] = data.map((order: any) => ({
        items: order.items.map((item: any) => ({
          product_name: item.product_name,
          qty: item.qty,
          product_image:
            item.product?.images?.find((img: any) => img.is_main)
              ?.origin_image ?? null,
          color: item.color,
          product_id: item.product_id,
        })),
        status: order.status,
        order_number: order.order_number,
        product_price: order.grand_total,
        payment_method_name: order.payment_method_name,
        shipping_method_name: order.shipping_method_name,
      }));
      setOrders(formattedOrders);
    } catch (err: any) {
      setError(err.message || t('myorder.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#7B2FF2" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{color: 'red', marginBottom: 10}}>{error}</Text>
        <TouchableOpacity onPress={fetchOrders} style={styles.retryBtn}>
          <Text style={{color: '#fff'}}>{t('myorder.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7B2FF2" />
      <LinearGradient colors={["#7B2FF2", "#F357A8"]} style={styles.headerGradient}>
        <Header showImage={false} title={t('myorder.title')} />
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {orders.length > 0 ? (
          orders.map((order, orderIndex) => (
            <View key={orderIndex} style={styles.orderCard}>
              <View style={styles.orderHeaderRow}>
                <Text style={styles.orderNumber}>{t('myorder.order_number')}: {order.order_number}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status?.toLowerCase() || 'pending'] || '#7B2FF2' }] }>
                  <Text style={styles.statusBadgeText}>{order.status || t('myorder.onProgress')}</Text>
                </View>
              </View>
              <View style={styles.orderInfoRow}>
                <Icon name="credit-card" type="Feather" size={18} color="#7B2FF2" style={{ marginRight: 6 }} />
                <Text style={styles.orderInfoText}>{order.payment_method_name || t('myorder.payment_method')}</Text>
                <Icon name="truck" type="Feather" size={18} color="#F357A8" style={{ marginLeft: 16, marginRight: 6 }} />
                <Text style={styles.orderInfoText}>{order.shipping_method_name || t('myorder.shipping_method')}</Text>
              </View>
              <View style={styles.itemsList}>
                {order.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.itemRow}>
                    <Image
                      source={{uri: item.product_image}}
                      style={styles.itemImg}
                      resizeMode="cover"
                    />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemTitle}>{item.product_name}</Text>
                      <Text style={styles.itemSub}>{t('myorder.color')}: {item.color || 'N/A'}</Text>
                      <Text style={styles.itemSub}>{t('myorder.qty')}: {item.qty}</Text>
                    </View>
                    <View style={styles.rightSide}>
                      <Text style={styles.priceText}>{currency} {(order.product_price * item.qty * rate).toFixed(2)}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <View style={styles.orderFooterRow}>
                <Text style={styles.orderTotalLabel}>{t('myorder.total_amount')}:</Text>
                <Text style={styles.orderTotalValue}>{currency} {(order.product_price * rate).toFixed(2)}</Text>
                <TouchableOpacity style={styles.reviewBtn} onPress={() => { setSelectedOrder(order); openOrderReview(); }}>
                  <Icon name="star" type="Feather" size={18} color="#fff" />
                  <Text style={styles.reviewBtnText}>{t('myorder.Review')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={{textAlign: 'center', marginTop: 20, color: '#888', fontSize: 16}}>
            {t('myorder.noCurrentOrders')}
          </Text>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
      {/* Review Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        <BottomSheetView style={{alignItems: 'center', padding: 20}}>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#7B2FF2'}}>
            {t('myorder.leaveReview')}
          </Text>
          {/* Star Rating */}
          <View style={{flexDirection: 'row', marginBottom: 15}}>
            {[1, 2, 3, 4, 5].map(num => (
              <TouchableOpacity key={num} onPress={() => setRating(num)}>
                <Text
                  style={{
                    fontSize: 30,
                    color: num <= rating ? '#F357A8' : '#ccc',
                  }}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Review Text */}
          <TextInput
            style={{
              width: '100%',
              borderColor: '#ccc',
              borderWidth: 1,
              borderRadius: 8,
              padding: 10,
              marginBottom: 15,
              textAlignVertical: 'top',
            }}
            multiline
            numberOfLines={4}
            placeholder={t('myorder.writeReview')}
            value={reviewText}
            onChangeText={setReviewText}
          />
          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitReviewBtn}
            onPress={handleSubmitReview}
            activeOpacity={0.85}
          >
            <Text style={styles.submitReviewBtnText}>{t('myorder.submitReview')}</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7FB' },
  center: { justifyContent: 'center', alignItems: 'center' },
  headerGradient: {
    width: '100%',
    paddingTop: 0,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 8,
  },
  scrollContent: {
    paddingVertical: 18,
    paddingHorizontal: 12,
    paddingBottom: 60,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.09,
    shadowRadius: 12,
    padding: 18,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7B2FF2',
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  orderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderInfoText: {
    fontSize: 14,
    color: '#7B2FF2',
    fontWeight: '600',
  },
  itemsList: {
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F7FB',
    borderRadius: 12,
    marginBottom: 10,
    padding: 10,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#eee',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 2,
  },
  itemTitle: {
    fontWeight: '700',
    fontSize: 15,
    color: '#333',
    marginBottom: 2,
  },
  itemSub: {
    fontSize: 12,
    color: '#888',
    marginBottom: 1,
  },
  rightSide: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
  },
  priceText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#7B2FF2',
  },
  orderFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  orderTotalLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  orderTotalValue: {
    fontSize: 16,
    color: '#7B2FF2',
    fontWeight: '700',
    marginLeft: 6,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F357A8',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginLeft: 10,
    elevation: 2,
    shadowColor: '#F357A8',
    shadowOpacity: 0.09,
    shadowRadius: 6,
  },
  reviewBtnText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 15,
  },
  submitReviewBtn: {
    backgroundColor: '#7B2FF2',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginTop: 8,
    elevation: 2,
  },
  submitReviewBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#7B2FF2',
    borderRadius: 8,
  },
});

export default MyOrders;

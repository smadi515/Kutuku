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
} from 'react-native';
import Header from '../components/Header';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

const API_ORDERS_URL = 'https://api.sareh-nomow.website/api/orders/user';

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
  const openOrderDetail = () => bottomSheetRef.current?.expand();
  const openOrderReview = () => bottomSheetRef.current?.expand();
  const handleSubmitReview = async () => {
    if (!selectedOrder || selectedOrder.items.length === 0) return;
    const productId = selectedOrder.items[0].product_id; // adjust if needed

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('https://api.sareh-nomow.xyz/api/reviews', {
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
      });
      console.log('productId', productId);

      const result = await response.json();
      console.log('Review submitted:', result);
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
        },
      });

      if (!response.ok) {
        throw new Error(t('myorder.fetchError'));
      }

      const data = await response.json();
      console.log('Orders API response:', data);

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
      console.log('formattedOrders', formattedOrders);

      setOrders(formattedOrders);
      console.log('formattedOrders', formattedOrders);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
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
        <ActivityIndicator size="large" color="#6A5AE0" />
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
      <Header showImage={false} title={t('myorder.title')} showBack={true} />
      <ScrollView>
        {orders.length > 0 ? (
          orders.map((order, orderIndex) => (
            <View key={orderIndex} style={styles.orderCard}>
              {order.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.itemRow}>
                  <Image
                    source={{uri: item.product_image}}
                    style={styles.itemImg}
                    resizeMode="contain"
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemTitle}>{order.order_number}</Text>
                    <Text style={styles.itemSub}>
                      {t('myorder.color')}: {item.color || 'N/A'}
                    </Text>
                    <Text style={styles.itemSub}>
                      {t('myorder.qty')}: {item.qty}
                    </Text>
                  </View>
                  <View style={styles.rightSide}>
                    <View style={styles.statusBox}>
                      <Text style={styles.statusText}>
                        {order.status || t('myorder.onProgress')}
                      </Text>
                    </View>
                    <Text style={styles.priceText}>
                      ${order.product_price * item.qty}
                    </Text>
                  </View>
                </View>
              ))}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() => {
                    setSelectedOrder(order);
                    openOrderDetail();
                  }}>
                  <Text>{t('myorder.detail')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.trackingBtn}
                  onPress={() => {
                    setSelectedOrder(order);
                    openOrderReview();
                  }}>
                  <Text style={{color: '#fff'}}>{t('myorder.Review')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={{textAlign: 'center', marginTop: 20}}>
            {t('myorder.noCurrentOrders')}
          </Text>
        )}
      </ScrollView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{alignItems: 'center', padding: 10}}>
          <View
            style={[styles.sheetContent, {direction: isRTL ? 'rtl' : 'ltr'}]}>
            {selectedOrder ? (
              <>
                <Text style={{fontWeight: 'bold', fontSize: 16}}>
                  {t('myorder.order_number')}:
                </Text>
                <Text>{selectedOrder.order_number}</Text>

                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  {t('myorder.status')}:
                </Text>
                <Text>{selectedOrder.status}</Text>

                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  {t('myorder.payment_method')}:
                </Text>
                <Text>{selectedOrder.payment_method_name || 'N/A'}</Text>

                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  {t('myorder.shipping_method')}:
                </Text>
                <Text>{selectedOrder.shipping_method_name || 'N/A'}</Text>

                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  {t('myorder.total_amount')}:
                </Text>
                <Text>${selectedOrder.product_price.toFixed(2)}</Text>

                <Text style={{fontWeight: 'bold', marginTop: 10}}>
                  {t('myorder.items')}:
                </Text>
                {selectedOrder.items.map((item, idx) => (
                  <View key={idx} style={{marginBottom: 8}}>
                    <Text>
                      {t('myorder.name')}: {item.product_name}
                    </Text>
                    <Text>
                      {t('myorder.qty')}: {item.qty}
                    </Text>
                  </View>
                ))}
              </>
            ) : (
              <Text>{t('myorder.no_details')}</Text>
            )}
          </View>
        </BottomSheetView>
      </BottomSheet>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{alignItems: 'center', padding: 20}}>
          <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 10}}>
            {t('myorder.leaveReview')}
          </Text>

          {/* Star Rating */}
          <View style={{flexDirection: 'row', marginBottom: 15}}>
            {[1, 2, 3, 4, 5].map(num => (
              <TouchableOpacity key={num} onPress={() => setRating(num)}>
                <Text
                  style={{
                    fontSize: 30,
                    color: num <= rating ? 'gold' : 'gray',
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
            style={{
              backgroundColor: '#6A5AE0',
              padding: 12,
              borderRadius: 8,
              width: '100%',
              alignItems: 'center',
            }}
            onPress={handleSubmitReview}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>
              {t('myorder.submitReview')}
            </Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F0FF', paddingTop: 10},
  sheetContent: {
    padding: 20,
  },
  center: {justifyContent: 'center', alignItems: 'center'},
  orderCard: {
    margin: 16,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  itemImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 10,
  },
  itemTitle: {
    fontWeight: 'bold',
  },
  itemSub: {
    fontSize: 12,
    color: '#666',
  },
  rightSide: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusBox: {
    backgroundColor: '#E0F7FA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#2196F3',
  },
  priceText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  detailBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  trackingBtn: {
    padding: 10,
    backgroundColor: '#6A5AE0',
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#6A5AE0',
    borderRadius: 8,
  },
});

export default MyOrders;

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Header from '../components/Header';

const API_ORDERS_URL = 'https://your-api.com/api/orders'; // <-- replace with your actual orders API URL

type OrderItem = {
  title: string;
  quantity: number;
  price: number;
  color?: string;
  image: string; // image URL string
};

type Order = {
  items: OrderItem[];
  status?: string;
};

const MyOrders = () => {
  const [activeTab, setActiveTab] = useState<'MyOrder' | 'History'>('MyOrder');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use your actual auth token if required
      // const token = await AsyncStorage.getItem('token');

      const response = await fetch(
        API_ORDERS_URL /*, {
        headers: { Authorization: `Bearer ${token}` }
      }*/,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();

      // Assuming your API returns the order in a similar structure:
      // { items: [...], status: '...' }
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
          <Text style={{color: '#fff'}}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header showImage={false} title="MyOrder" showBack={true} />
      <ScrollView>
        <View style={styles.tabSwitch}>
          <TouchableOpacity onPress={() => setActiveTab('MyOrder')}>
            <Text
              style={
                activeTab === 'MyOrder' ? styles.activeTab : styles.inactiveTab
              }>
              My Order
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('History')}>
            <Text
              style={
                activeTab === 'History' ? styles.activeTab : styles.inactiveTab
              }>
              History
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'MyOrder' && order ? (
          <View style={styles.orderCard}>
            {order.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Image
                  source={{uri: item.image}}
                  style={styles.itemImg}
                  resizeMode="contain"
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSub}>
                    Color: {item.color || 'N/A'}
                  </Text>
                  <Text style={styles.itemSub}>Qty: {item.quantity}</Text>
                </View>
                <View style={styles.rightSide}>
                  <View style={styles.statusBox}>
                    <Text style={styles.statusText}>
                      {order.status || 'On Progress'}
                    </Text>
                  </View>
                  <Text style={styles.priceText}>
                    ${item.price * item.quantity}
                  </Text>
                </View>
              </View>
            ))}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.detailBtn}>
                <Text>Detail</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.trackingBtn}>
                <Text style={{color: '#fff'}}>Tracking</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          activeTab === 'MyOrder' && (
            <Text style={{textAlign: 'center', marginTop: 20}}>
              No current orders.
            </Text>
          )
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7f7'},
  center: {justifyContent: 'center', alignItems: 'center'},
  tabSwitch: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  activeTab: {
    marginRight: 20,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderColor: 'purple',
    paddingBottom: 4,
    color: '#000',
  },
  inactiveTab: {
    marginRight: 20,
    color: '#888',
    paddingBottom: 4,
  },
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

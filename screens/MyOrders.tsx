import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import Header from '../components/Header';
import {useRoute, RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../App';

const MyOrders = () => {
  const [activeTab, setActiveTab] = useState('MyOrder'); // ✅ Fixed typo
  const route = useRoute<RouteProp<RootStackParamList, 'MyOrders'>>();
  const {newOrder} = route.params || {};

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

        {activeTab === 'MyOrder' && newOrder && (
          <View style={styles.orderCard}>
            {newOrder.items.map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <Image source={item.image} style={styles.itemImg} />
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
                      {newOrder.status || 'On Progress'}
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
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7f7'},
  tabSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

export default MyOrders;

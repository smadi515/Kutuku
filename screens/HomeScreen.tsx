// Home.tsx
import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from '../components/icon';
import ProductCard from '../components/ProductCard';
import CategoryTab from './CategoryTab';

const products = [
  {
    id: '1',
    image: require('../assets/Maskgroup4.png'),
    title: 'The Mirac Jiz',
    designer: 'Lisa Robber',
    price: '195.00',
  },
  {
    id: '2',
    image: require('../assets/Maskgroup4.png'),
    title: 'Meriza Kiles',
    designer: 'Lisa Robber',
    price: '143.45',
  },
  {
    id: '3',
    image: require('../assets/Maskgroup4.png'),
    title: 'Meriza Kiles',
    designer: 'Lisa Robber',
    price: '143.45',
  },
  {
    id: '4',
    image: require('../assets/Maskgroup4.png'),
    title: 'Meriza Kiles',
    designer: 'Lisa Robber',
    price: '143.45',
  },
  {
    id: '5',
    image: require('../assets/Maskgroup4.png'),
    title: 'Meriza Kiles',
    designer: 'Lisa Robber',
    price: '143.45',
  },
  {
    id: '6',
    image: require('../assets/Maskgroup4.png'),
    title: 'Meriza Kiles',
    designer: 'Lisa Robber',
    price: '143.45',
  },
  // Add more products if needed
];

const HomeScreen = ({navigation}: any) => {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={require('../assets/Maskgroup4.png')}
              style={styles.avatar}
            />
            <View style={{marginLeft: 10}}>
              <Text style={styles.greeting}>Hi, Jonathan</Text>
              <Text style={styles.subText}>Let’s go shopping</Text>
            </View>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon
              name="search1"
              type="ant"
              size={22}
              color="#333"
              style={{marginRight: 15}}
              onPress={() => navigation.navigate('SearchScreen')}
            />
            <Icon
              name="notifications-outline"
              type="ionicon"
              size={22}
              color="#333"
            />
          </View>
        </View>

        {/* Tabs */}

        <View style={styles.tabSwitch}>
          <TouchableOpacity onPress={() => setActiveTab('Home')}>
            <Text
              style={
                activeTab === 'Home' ? styles.activeTab : styles.inactiveTab
              }>
              Home
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('category')}>
            <Text
              style={
                activeTab === 'category' ? styles.activeTab : styles.inactiveTab
              }>
              Category
            </Text>
          </TouchableOpacity>
        </View>

        {/* Promo Banner */}
        {activeTab === 'Home' && (
          <View style={{marginTop: 20}}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingLeft: 16}}>
              <Image
                source={require('../assets/Maskgroup4.png')}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <Image
                source={require('../assets/Maskgroup4.png')}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <Image
                source={require('../assets/Maskgroup4.png')}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </ScrollView>
          </View>
        )}
        {/* New Arrivals Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>New Arrivals 🔥</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>

        {activeTab === 'Home' ? (
          <FlatList
            data={products}
            numColumns={2}
            keyExtractor={item => item.id}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            renderItem={({item}) => <ProductCard {...item} />}
            scrollEnabled={false}
          />
        ) : (
          <CategoryTab />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7f7'},
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greeting: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  subText: {
    fontSize: 12,
    color: '#888',
  },
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
    borderColor: '#00BCD4',
    paddingBottom: 4,
    color: '#000',
  },
  inactiveTab: {
    marginRight: 20,
    color: '#888',
    paddingBottom: 4,
  },
  bannerImage: {
    width: 280,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerSub: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 12,
    color: '#00BCD4',
  },
});

export default HomeScreen;

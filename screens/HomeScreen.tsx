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
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [favorites, setFavorites] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState('Home');
  const handleAddToCart = async (product: any) => {
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];
      const index = cart.findIndex((item: any) => item.id === product.id);

      if (index >= 0) {
        cart[index].quantity += 1;
      } else {
        cart.push({...product, quantity: 1});
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      navigation.navigate('CartScreen');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };
  const toggleFavorite = async (productId: string) => {
    try {
      let updatedFavorites: string[];
      if (favorites.includes(productId)) {
        updatedFavorites = favorites.filter(id => id !== productId);
      } else {
        updatedFavorites = [...favorites, productId];
      }
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };
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
              onPress={() => navigation.navigate('ChatScreen')}
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
          <TouchableOpacity onPress={() => navigation.navigate('StoreScreen')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'Home' ? (
          <FlatList
            data={products}
            numColumns={2}
            keyExtractor={item => item.id}
            columnWrapperStyle={{justifyContent: 'space-between'}}
            renderItem={({item}) => (
              <ProductCard
                title="Product Title"
                designer="Designer Name"
                price={199}
                image={require('../assets/bag.png')}
                isFavorite={favorites.includes(item.id)}
                onPressFavorite={() => toggleFavorite(item.id)}
                onPressCart={() => handleAddToCart(item)}
                colors={[
                  {color: '#ff0000', image: require('../assets/bag.png')},
                  {
                    color: '#0000FF',
                    image: require('../assets/speaker.png'),
                  }, // <-- added blue color
                ]} // <-- you must pass this!
              />
            )}
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

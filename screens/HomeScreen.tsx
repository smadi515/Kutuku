import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from '../components/icon';
import ProductCard from '../components/ProductCard';
import CategoryTab from './CategoryTab';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getProducts} from '../lib/api';
import BrandTab from './BrandTab';

type ProductDescription = {
  name?: string;
  description?: string;
  short_description?: string;
};

type ProductImage = {
  is_main: boolean;
  listing_image: string;
};

type Product = {
  product_id: number;
  name: string;
  short_description: string;
  description: string;
  price: number;
  stock_availability: boolean;
  images?: ProductImage[];
  image?: string;
  description_data?: ProductDescription;
};

const HomeScreen = ({navigation}: any) => {
  const [quantity, setQuantity] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('Home');
  const [loading, setLoading] = useState(true);
  console.log(setQuantity);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getProducts();

        const transformed = result.map((product: Product) => {
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

          return {
            ...product,
            image: mainImage?.listing_image || '',
            name: desc.name || 'No name',
            description: desc.description || '',
            short_description: desc.short_description || '',
          };
        });

        setProducts(transformed);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const fullName = await AsyncStorage.getItem('userFullName');
        if (fullName) {
          console.log('✅ Full name from storage:', fullName);
          setFirstName(fullName.split(' ')[0]);
        } else {
          console.log('⚠️ No full name found in AsyncStorage');
        }
      } catch (error) {
        console.error('Error reading full name:', error);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="purple" style={{marginTop: 20}} />
    );
  }

  const handleAddToCart = async (item: any) => {
    const storedCart = await AsyncStorage.getItem('cart');
    let cart = storedCart ? JSON.parse(storedCart) : [];

    const newItemId = item.product_id.toString();

    const existingItemIndex = cart.findIndex(
      (cartItem: any) => cartItem.id === newItemId,
    );

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      const newItem = {
        id: newItemId,
        title: item.name,
        price: item.price,
        quantity,
        selected: true,
        image: item.image
          ? {uri: item.image}
          : {uri: 'https://via.placeholder.com/150'},
      };
      cart.push(newItem);
    }

    await AsyncStorage.setItem('cart', JSON.stringify(cart));
    navigation.navigate('CartScreen');
  };

  const toggleFavorite = async (productId: string) => {
    try {
      let updatedFavorites: string[] = [];
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
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={require('../assets/Maskgroup4.png')}
            style={styles.avatar}
          />
          <View style={{marginLeft: 10}}>
            <Text>hi,{firstName || 'Guest'}</Text>
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
            onPress={() => navigation.navigate('NotificationScreen')}
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
        <TouchableOpacity onPress={() => setActiveTab('brands')}>
          <Text
            style={
              activeTab === 'brands' ? styles.activeTab : styles.inactiveTab
            }>
            Brands
          </Text>
        </TouchableOpacity>
      </View>

      {/* Product Grid or Categories */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="purple"
          style={{marginTop: 20}}
        />
      ) : activeTab === 'Home' ? (
        <FlatList
          data={products}
          keyExtractor={item => item.product_id.toString()}
          numColumns={2}
          ListHeaderComponent={
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>New Arrivals</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('StoreScreen')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({item}) => (
            <ProductCard
              title={item.name}
              designer={item.short_description}
              price={item.price}
              image={item.image ?? ''}
              isFavorite={favorites.includes(item.product_id.toString())}
              onPressFavorite={() => toggleFavorite(item.product_id.toString())}
              onPressCart={() => handleAddToCart(item)}
              stock={item.stock_availability}
              description={item.description}
              product_id={item.product_id}
            />
          )}
          columnWrapperStyle={styles.row}
          contentContainerStyle={{paddingHorizontal: 8}}
        />
      ) : activeTab === 'category' ? (
        <CategoryTab />
      ) : (
        <BrandTab />
      )}
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
    color: 'red',
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
    borderColor: 'purple',
    paddingBottom: 4,
    color: '#000',
  },
  inactiveTab: {
    marginRight: 20,
    color: '#888',
    paddingBottom: 4,
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
    color: 'purple',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});

export default HomeScreen;

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
import {
  getProducts,
  getCustomerCart,
  createCart,
  addItemToCart,
} from '../lib/api';
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
  console.log(setQuantity);
  const [firstName, setFirstName] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('Home');
  const [loading, setLoading] = useState(true);

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
          setFirstName(fullName.split(' ')[0]);
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

  const handleAddToCart = async (item: Product) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('User not logged in');
        return;
      }

      // 1. Ensure customer cart exists
      let cart = await getCustomerCart(token);
      if (!cart || !cart.cart_id) {
        cart = await createCart(token);
      }

      if (!cart || !cart.cart_id) {
        console.error('Failed to get or create cart');
        return;
      }

      // 2. Send to backend
      await addItemToCart(
        token,
        cart.cart_id,
        item.product_id.toString(),
        quantity,
      );

      // 3. Add to local AsyncStorage cart
      const storedCart = await AsyncStorage.getItem('cart');
      const parsedCart = storedCart ? JSON.parse(storedCart) : [];

      const newItem = {
        id: item.product_id.toString(),
        title: item.name,
        price: item.price,
        quantity: quantity,
        selected: true,
        image: {uri: item.image},
      };

      const updatedCart = [...parsedCart, newItem];
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));

      // 4. Navigate to CartScreen (no need to pass item now)
      navigation.navigate('CartScreen');
    } catch (error) {
      console.error('Error in handleAddToCart:', error);
    }
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

  if (loading) {
    return (
      <ActivityIndicator size="large" color="purple" style={{marginTop: 20}} />
    );
  }

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
            <Text>hi, {firstName || 'Guest'}</Text>
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
      {activeTab === 'Home' ? (
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

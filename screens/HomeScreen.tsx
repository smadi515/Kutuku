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
  addItemToCart,
  updateCartItemQuantity,
} from '../lib/api';
import BrandTab from './BrandTab';
import {useTranslation} from 'react-i18next';
import CollectionSection from '../components/CollectionSection';

type LocalCartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  selected: boolean;
  image: {uri?: string};
  cart_item_id: number | null;
};
type ProductDescription = {
  name?: string;
  description?: string;
  short_description?: string;
};

type ProductImage = {
  is_main: boolean;
  listing_image: string;
  origin_image: string;
};

type Product = {
  product_id: number;
  name: string;
  short_description: string;
  description: string;
  price: number;
  inventory?: {
    stock_availability: boolean;
    qty: number;
    manage_stock: boolean;
  };
  images?: ProductImage[];
  image?: string;
  description_data?: ProductDescription;
};
type BackendCartItem = {
  product_id: number | string;
  cart_item_id: number;
  quantity: number;
  // add other relevant fields if you have them
};

const HomeScreen = ({navigation}: any) => {
  const [quantity] = useState(1); // No need to change quantity for now
  const [firstName, setFirstName] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('Home');
  const [loading, setLoading] = useState(true);
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getProducts(i18n.language); // pass language here
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
            image: mainImage?.origin_image || '', // ✅ updated here
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
  }, [i18n.language]);

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
      console.log('Starting handleAddToCart for product:', item.product_id);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('User not logged in');
        return;
      }

      let cart = await getCustomerCart(token);
      if (!cart || !cart.cart_id) {
      }

      if (!cart || !cart.cart_id) {
        console.error('Failed to get or create cart');
        return;
      }

      const storedCart = await AsyncStorage.getItem('cart');
      const parsedCart: LocalCartItem[] = storedCart
        ? JSON.parse(storedCart)
        : [];

      const backendCartItems: BackendCartItem[] = cart.items || [];

      // Sync cart_item_ids into parsedCart
      parsedCart.forEach(localItem => {
        const backendItem = backendCartItems.find(
          bItem => bItem.product_id.toString() === localItem.id,
        );
        if (backendItem) {
          localItem.cart_item_id = backendItem.cart_item_id;
        }
      });

      const existingItemIndex = parsedCart.findIndex(
        cartItem => cartItem.id.toString() === item.product_id.toString(),
      );

      if (existingItemIndex !== -1) {
        // Update quantity
        const existingItem = parsedCart[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        if (!existingItem.cart_item_id) {
          console.error('Cannot update: cart_item_id is missing');
          return;
        }

        await updateCartItemQuantity(
          token,
          existingItem.cart_item_id,
          cart.cart_id,
          newQuantity,
        );

        parsedCart[existingItemIndex].quantity = newQuantity;
        console.log('Updated existing item quantity:', newQuantity);
      } else {
        // Add new item
        const backendResponse = await addItemToCart(
          token,
          item.product_id.toString(),
          quantity,
        );

        const newItem: LocalCartItem = {
          id: item.product_id.toString(),
          title: item.name,
          price: item.price,
          quantity: quantity,
          selected: true,
          image: {uri: item.image ?? ''},
          cart_item_id: backendResponse?.cart_item_id || null,
        };

        parsedCart.push(newItem);
        console.log('Added new item to cart:', newItem);
      }
      await AsyncStorage.setItem('cart', JSON.stringify(parsedCart));

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
    <View style={[styles.container, {direction: isRTL ? 'rtl' : 'ltr'}]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Image
            source={require('../assets/Maskgroup4.png')}
            style={styles.avatar}
          />
          <View style={{marginLeft: 10}}>
            <Text>
              {t('HomeScreen.hi')} {firstName || 'Guest'}
            </Text>
            <Text style={styles.subText}>{t('HomeScreen.letsGoShopping')}</Text>
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
            name="cart"
            type="ionicon"
            size={22}
            color="#333"
            onPress={() => navigation.navigate('CartScreen')}
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
            {t('HomeScreen.home')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('category')}>
          <Text
            style={
              activeTab === 'category' ? styles.activeTab : styles.inactiveTab
            }>
            {t('HomeScreen.category')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('brands')}>
          <Text
            style={
              activeTab === 'brands' ? styles.activeTab : styles.inactiveTab
            }>
            {t('HomeScreen.brands')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'Home' ? (
        <FlatList
          data={products}
          keyExtractor={item => item.product_id.toString()}
          numColumns={2}
          ListHeaderComponent={
            <View>
              <CollectionSection />

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {t('HomeScreen.newArrivals')}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('StoreScreen')}>
                  <Text style={styles.seeAll}>{t('HomeScreen.SeeAll')}</Text>
                </TouchableOpacity>
              </View>
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
              stock_availability={item.inventory?.stock_availability ?? false}
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
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  card: {
    alignItems: 'center',
    marginRight: 12,
    width: 100,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 6,
  },
  name: {
    fontSize: 12,
    textAlign: 'center',
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

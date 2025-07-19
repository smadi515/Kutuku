import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from '../components/icon';
import ProductCard from '../components/ProductCard';
import CategoryTab from './CategoryTab';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import {
  getProducts,
  getCustomerCart,
  addItemToCart,
  updateCartItemQuantity,
  getAvailableCurrencies,
} from '../lib/api';
import BrandTab from './BrandTab';
import { useTranslation } from 'react-i18next';
import CollectionSection from '../components/CollectionSection';
import Toast from 'react-native-toast-message';
import { useCurrency } from '../contexts/CurrencyContext';

type LocalCartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  selected: boolean;
  image: { uri?: string };
  cart_item_id: number | null;
};

type ProductDescription = {
  product_description_id: number;
  product_description_product_id: number;
  name: string;
  description: string;
  short_description: string | null;
  url_key: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  created_at: string;
  updated_at: string;
};

type ProductImage = {
  product_image_id: number;
  product_image_product_id: number;
  origin_image: string;
  thumb_image: string | null;
  listing_image: string | null;
  single_image: string | null;
  is_main: boolean;
  created_at: string;
  updated_at: string;
};

type ProductInventory = {
  product_inventory_id: number;
  product_inventory_product_id: number;
  qty: number;
  manage_stock: boolean;
  stock_availability: boolean;
  created_at: string;
  updated_at: string;
};

type Product = {
  product_id: number;
  uuid: string;
  type: string;
  variant_group_id: number | null;
  visibility: boolean;
  group_id: number;
  sku: string;
  price: number;
  old_price: number | null;
  is_digital: boolean;
  weight: number;
  tax_class: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
  category_id: number;
  brand_id: number;
  description: ProductDescription;
  images: ProductImage[];
  inventory: ProductInventory;
  // Optional: category and brand objects
  category?: any;
  brand?: any;
  attributes?: any[];
  reviews?: any[];
  meanRating?: number | null;
};

type BackendCartItem = {
  product_id: number | string;
  cart_item_id: number;
  quantity: number;
};
type ExtendedProduct = Product & {
  image: string;
  name: string;
  description: string;
  short_description: string;
};

const HomeScreen = ({ navigation }: any) => {
  const currencyFlags: Record<string, string> = {
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    JOD: '🇯🇴',
    SAR: '🇸🇦',
  };
  const currencyRates: Record<string, number> = {
    USD: 1,
    EUR: 0.91,
    GBP: 0.77,
    JOD: 0.71,
    SAR: 3.75,
  };
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JOD: 'JD',
    SAR: '﷼',
  };

  const [cartCount, setCartCount] = useState(0);
  const [showFirstOpenModal, setShowFirstOpenModal] = useState(false);

  const { changeCurrency } = useCurrency();

  const rate = 1; // Default rate since currency is now handled in settings

  const [quantity] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [activeTab, setActiveTab] = useState('Home');
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  // const isRTL = i18n.language === 'ar';
  console.log('products', products);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getProducts(i18n.language);

        // Filter out products missing essential data
        const filtered = result.filter(
          (product: Product) =>
            product.description &&
            product.description.name &&
            product.description.url_key &&
            product.images &&
            product.images.length > 0,
        );

        setProducts(filtered);
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
          // setFavorites(JSON.parse(storedFavorites)); // This line is removed
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    };

    loadFavorites();
  }, []);

  // Load cart count every time HomeScreen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadCartCount = async () => {
        try {
          const storedCart = await AsyncStorage.getItem('cart');
          const parsedCart = storedCart ? JSON.parse(storedCart) : [];
          setCartCount(parsedCart.length);
        } catch (error) {
          setCartCount(0);
        }
      };
      loadCartCount();
    }, [])
  );

  useEffect(() => {
    const checkFirstOpen = async () => {
      try {
        const hasOpened = await AsyncStorage.getItem('hasOpenedApp');
        if (!hasOpened) {
          setShowFirstOpenModal(true);
          await AsyncStorage.setItem('hasOpenedApp', 'true');
        }
      } catch (error) {
        // fail silently
      }
    };
    checkFirstOpen();
  }, []);

  const handleAddToCart = async (item: Product) => {
    try {
      console.log('Starting handleAddToCart for product:', item.product_id);

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Please log in',
          text2: 'You must be logged in to add to cart.',
        });
        return;
      }

      let cart = await getCustomerCart(token);
      if (!cart || !cart.cart_id) {
        Toast.show({
          type: 'error',
          text1: 'Cart Error',
          text2: 'Could not fetch or create a cart.',
        });
        return;
      }

      const storedCart = await AsyncStorage.getItem('cart');
      const parsedCart: LocalCartItem[] = storedCart
        ? JSON.parse(storedCart)
        : [];

      const backendCartItems: BackendCartItem[] = cart.items || [];

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
        const existingItem = parsedCart[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;

        if (!existingItem.cart_item_id) {
          Toast.show({
            type: 'error',
            text1: 'Update Failed',
            text2: 'Item missing cart_item_id.',
          });
          return;
        }

        await updateCartItemQuantity(
          token,
          existingItem.cart_item_id,
          cart.cart_id,
          newQuantity,
        );

        parsedCart[existingItemIndex].quantity = newQuantity;

        Toast.show({
          type: 'success',
          text1: 'Cart Updated',
          text2: `${item.description.name} has been added.`,
        });
      } else {
        const backendResponse = await addItemToCart(
          token,
          item.product_id.toString(),
          quantity,
        );

        const newItem: LocalCartItem = {
          id: item.product_id.toString(),
          title: item.description.name,
          price: item.price,
          quantity: quantity,
          selected: true,
          image: {
            uri: item.images?.find(img => img.is_main)?.origin_image ?? '',
          },
          cart_item_id: backendResponse?.cart_item_id || null,
        };

        parsedCart.push(newItem);

        Toast.show({
          type: 'success',
          text1: 'Added to Cart',
          text2: `${item.description.name} quantity updated.`,
        });
      }

      await AsyncStorage.setItem('cart', JSON.stringify(parsedCart));
      setCartCount(parsedCart.length);
      navigation.navigate('CartScreen');
    } catch (error) {
      console.error('Error in handleAddToCart:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while adding to cart.',
      });
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="#7B2FF2" style={{ marginTop: 20 }} />
    );
  }
  const screenWidth = Dimensions.get('window').width;
  const cardMargin = 8;
  const cardWidth = (screenWidth - cardMargin * 4) / 2; // 2 cards, 3 margins (left, middle, right)
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Shein-style Header */}
      <View style={styles.header}>
        {/* App Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>KUTUKU</Text>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => navigation.navigate('SearchScreen')}
        >
          <Icon name="search1" type="ant" size={16} color="#999" style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>
            {t('HomeScreen.searchPlaceholder') || 'Search for products...'}
          </Text>
        </TouchableOpacity>

        {/* Cart Icon */}
        <TouchableOpacity
          style={styles.cartContainer}
          onPress={() => navigation.navigate('CartScreen')}
        >
          <Icon name="shopping-cart" type="feather" size={20} color="#333" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabSwitch}>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('Home')}>
          <Text
            style={
              activeTab === 'Home' ? styles.activeTab : styles.inactiveTab
            }
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t('HomeScreen.home')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('category')}>
          <Text
            style={
              activeTab === 'category' ? styles.activeTab : styles.inactiveTab
            }
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t('HomeScreen.category')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('brands')}>
          <Text
            style={
              activeTab === 'brands' ? styles.activeTab : styles.inactiveTab
            }
            numberOfLines={1}
            ellipsizeMode="tail"
          >
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
          renderItem={({ item }) => {
            const { product_id, price, description, brand, images, inventory } =
              item;

            const convertedPrice = Math.round(price * rate);
            const currencySymbol = '$'; // Default currency symbol

            const urlKey = description?.url_key || '';
            const title = description?.name || 'Unnamed Product';
            const designer = brand?.name || 'No brand';
            const desc = description?.description || 'No description available';
            const image =
              images?.find((img: ProductImage) => img.is_main)?.origin_image ||
              images?.[0]?.origin_image ||
              'https://via.placeholder.com/150';

            return (
              <ProductCard
                product_id={product_id}
                urlKey={urlKey}
                title={title}
                designer={designer}
                price={convertedPrice}
                image={image}
                description={desc}
                currencySymbol={currencySymbol}
                stock_availability={inventory?.stock_availability ?? false}
                onPressCart={() => handleAddToCart(item)}
                cardWidth={cardWidth}
              />
            );
          }}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: cardMargin }}
          contentContainerStyle={{ paddingBottom: 16 }}
        />
      ) : activeTab === 'category' ? (
        <CategoryTab />
      ) : (
        <BrandTab />
      )}

      {/* First Open Modal */}
      <Modal
        visible={showFirstOpenModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFirstOpenModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', maxWidth: 320 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>{t('home.welcomeTitle') || 'Welcome to Kutuku!'}</Text>
            <Text style={{ fontSize: 15, color: '#555', marginBottom: 20, textAlign: 'center' }}>{t('home.welcomeMsg') || 'Here are some notifications or tips for you.'}</Text>
            <TouchableOpacity onPress={() => setShowFirstOpenModal(false)} style={{ backgroundColor: '#7B2FF2', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('home.close') || 'Close'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoContainer: {
    marginRight: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#999',
  },
  cartContainer: {
    position: 'relative',
    padding: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 2,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    fontWeight: '600',
    borderBottomWidth: 2,
    borderColor: '#333',
    paddingBottom: 8,
    color: '#333',
    paddingHorizontal: 4,
    fontSize: 14,
  },
  inactiveTab: {
    color: '#999',
    paddingBottom: 8,
    paddingHorizontal: 4,
    fontSize: 14,
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
    color: '#333',
  },
  seeAll: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default HomeScreen;

import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
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
  getAvailableCurrencies,
} from '../lib/api';
import BrandTab from './BrandTab';
import {useTranslation} from 'react-i18next';
import CollectionSection from '../components/CollectionSection';
import Toast from 'react-native-toast-message';
import {useCurrency} from '../contexts/CurrencyContext';
import LinearGradient from 'react-native-linear-gradient';

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

const HomeScreen = ({navigation}: any) => {
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
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const {changeCurrency} = useCurrency();

  const rate = selectedCurrency ? currencyRates[selectedCurrency] || 1 : 1;

  const [quantity] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [activeTab, setActiveTab] = useState('Home');
  const [loading, setLoading] = useState(true);
  const {t, i18n} = useTranslation();
  // const isRTL = i18n.language === 'ar';
  console.log('products', products);

  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const res = await getAvailableCurrencies(); // ['USD', 'EUR', 'JOD', ...]
        console.log('Available currencies:', res);

        if (res?.length > 0) {
          setCurrencies(res);

          // Get saved currency from AsyncStorage
          const saved = await AsyncStorage.getItem('selectedCurrency');

          if (saved && res.includes(saved)) {
            setSelectedCurrency(saved); // Use saved value
          } else {
            // If no saved or invalid, set the first currency
            setSelectedCurrency(res[0]);
            await AsyncStorage.setItem('selectedCurrency', res[0]); // Save fallback
          }
        }
      } catch (error) {
        console.error('Error loading currencies:', error);
      }
    };

    loadCurrencies();
  }, []);

  useEffect(() => {
    if (selectedCurrency) {
      AsyncStorage.setItem('selectedCurrency', selectedCurrency);
    }
  }, [selectedCurrency]);
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
      <ActivityIndicator size="large" color="#7B2FF2" style={{marginTop: 20}} />
    );
  }
  return (
    <View style={{flex: 1, backgroundColor: '#F7F7FB'}}>
      <LinearGradient
        colors={['#7B2FF2', '#F357A8']}
        style={styles.headerGradient}>
        <View style={styles.topBar}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={require('../assets/Maskgroup4.png')}
              style={styles.avatar}
            />
            <View style={{marginLeft: 10}}>
              <Text style={styles.topBarHi}>
                {t('HomeScreen.hi')} {firstName || 'Guest'}
              </Text>
              <Text style={styles.subText}>
                {t('HomeScreen.letsGoShopping')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setCurrencyModalVisible(true)}
              style={styles.currencyBtn}>
              {selectedCurrency ? (
                <Text style={styles.currencyText}>
                  {currencyFlags[selectedCurrency] || '🏳️'} {selectedCurrency}
                </Text>
              ) : (
                <Text style={[styles.currencyText, {color: '#aaa'}]}>
                  Loading...
                </Text>
              )}
              <Icon name="chevron-down" type="feather" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Icon
              name="search1"
              type="ant"
              size={22}
              color="#fff"
              style={{marginRight: 15}}
              onPress={() => navigation.navigate('SearchScreen')}
            />
            <Icon
              name="cart"
              type="ionicon"
              size={22}
              color="#fff"
              onPress={() => navigation.navigate('CartScreen')}
            />
          </View>
        </View>
      </LinearGradient>
      <Modal
        visible={currencyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCurrencyModalVisible(false)}>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            padding: 20,
          }}>
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 20,
              maxHeight: '60%',
            }}>
            <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>
              Select Currency
            </Text>
            {currencies.length === 0 ? (
              <Text>No currencies found.</Text>
            ) : (
              <FlatList
                data={currencies}
                keyExtractor={item => item}
                renderItem={({item}) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedCurrency(item);
                      setCurrencyModalVisible(false);
                      changeCurrency(item, currencyRates[item] || 1);
                    }}
                    style={{
                      paddingVertical: 10,
                      borderBottomWidth: 0.5,
                      borderBottomColor: '#ccc',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text style={{fontSize: 16}}>
                      {currencyFlags[item] || '🏳️'} {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
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
          renderItem={({item}) => {
            const {product_id, price, description, brand, images, inventory} =
              item;

            const convertedPrice = Math.round(price * rate);
            const currencySymbol = selectedCurrency
              ? currencySymbols[selectedCurrency] || ''
              : '';

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
                currencySymbol={currencySymbol} // ✅ use the variable
                stock_availability={inventory?.stock_availability ?? false}
                onPressCart={() => handleAddToCart(item)}
              />
            );
          }}
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
  headerGradient: {
    width: '100%',
    paddingTop: 0,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
  },
  topBarHi: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  currencyBtn: {
    backgroundColor: '#F357A8',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#F357A8',
    shadowOpacity: 0.13,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 3,
    elevation: 2,
  },
  currencyText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginRight: 4,
  },
  subText: {
    fontSize: 12,
    color: '#eee',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
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

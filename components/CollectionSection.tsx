import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../App';
import { useTranslation } from 'react-i18next';
import { getParentCategories } from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import ProductCard from './ProductCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCustomerCart, addItemToCart, updateCartItemQuantity } from '../lib/api';
import colors from '../utils/colors';
import LinearGradient from 'react-native-linear-gradient';
import Icon from './icon';

type ProductDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProductsDetails'
>;

type ProductDescription = {
  name: string;
  short_description: string;
  url_key: string;
  description: string;
};

type ProductImage = {
  origin_image: string;
};

type Product = {
  price: number;
  description: ProductDescription;
  images: ProductImage[];
  inventory: {
    stock_availability: boolean;
  };
};

type ProductItem = {
  product_id: number;
  product: Product;
};

type Collection = {
  collection_id: number;
  name: string;
  code: string;
  image: string;
  type: string;
  products: ProductItem[];
};
type Category = {
  id: number;
  name: string;
  image: string;
};

const CollectionSection = () => {
  const { currency, rate } = useCurrency();
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JOD: 'JD',
    SAR: '﷼',
  };
  const symbol = currencySymbols[currency] || '';

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();
  const { i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [quantity] = useState(1);

  const bannerRef = useRef<FlatList>(null);
  const currentBannerIndex = useRef(0);

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate('StoreScreen', { categoryId: item.id })}>
      <View style={styles.categoryImageContainer}>
        <Image source={{ uri: item.image }} style={styles.categoryImage} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)']}
          style={styles.categoryGradient}
        />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    const loadCategories = async () => {
      const data = await getParentCategories();
      setCategories(data);
    };

    loadCategories();
  }, []);
  const fetchCollections = useCallback(async () => {
    try {
      const lang = i18n.language || 'en';
      const response = await fetch(
        `https://api.sareh-nomow.website/api/client/v1/collections?lang=${lang}`,
      );
      const data = await response.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  }, [i18n.language]);
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Auto-scroll banner
  useEffect(() => {
    const banners = collections.filter(c => c.type === 'banner');
    if (!banners.length) return;

    const interval = setInterval(() => {
      currentBannerIndex.current =
        (currentBannerIndex.current + 1) % banners.length;
      bannerRef.current?.scrollToIndex({
        index: currentBannerIndex.current,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [collections]);

  // Handle scroll errors
  const handleScrollToIndexFailed = (info: any) => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      bannerRef.current?.scrollToIndex({
        index: currentBannerIndex.current,
        animated: true,
      });
    });
  };

  // Add to cart logic (copied from StoreScreen)
  const handleAddToCart = async (item: ProductItem) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        // Optionally show a login prompt
        return;
      }
      const storedCart = await AsyncStorage.getItem('cart');
      const parsedCart: any[] = storedCart ? JSON.parse(storedCart) : [];
      let cart = await getCustomerCart(token);
      if (!cart || !cart.cart_id) {
        return;
      }
      const backendCartItems: any[] = cart.items || [];
      parsedCart.forEach((localItem: any) => {
        const backendItem = backendCartItems.find(
          (bItem: any) => bItem.product_id.toString() === localItem.id,
        );
        if (backendItem) {
          localItem.cart_item_id = backendItem.cart_item_id;
        }
      });
      const existingItemIndex = parsedCart.findIndex(
        (cartItem: any) => cartItem.id.toString() === item.product_id.toString(),
      );
      if (existingItemIndex !== -1) {
        const existingItem = parsedCart[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        if (!existingItem.cart_item_id) {
          // Optionally show error
          return;
        }
        await updateCartItemQuantity(
          token,
          existingItem.cart_item_id,
          cart.cart_id,
          newQuantity,
        );
        parsedCart[existingItemIndex].quantity = newQuantity;
      } else {
        const backendResponse = await addItemToCart(
          token,
          item.product_id.toString(),
          quantity,
        );
        const newItem = {
          id: item.product_id.toString(),
          title: item.product.description.name,
          price: item.product.price,
          quantity: quantity,
          selected: true,
          image: { uri: item.product.images[0]?.origin_image || '' },
          cart_item_id: backendResponse?.cart_item_id || null,
        };
        parsedCart.push(newItem);
      }
      await AsyncStorage.setItem('cart', JSON.stringify(parsedCart));
      navigation.navigate('CartScreen');
    } catch (error) {
      // Optionally show error
    }
  };

  const renderProduct = ({ item }: { item: ProductItem }) => {
    const { product } = item;
    const { description, price, images, inventory } = product;
    const stockAvailability = inventory.stock_availability;
    const urlKey = product?.description?.url_key || '';
    const imageUri = images[0]?.origin_image || '';
    return (
      <ProductCard
        product_id={item.product_id}
        urlKey={urlKey}
        title={description.name}
        designer={''}
        price={Math.round(price * rate)}
        currencySymbol={symbol}
        image={imageUri}
        description={description.description}
        stock_availability={stockAvailability}
        onPressCart={() => handleAddToCart(item)}
        cardWidth={cardWidth}
        cartIconSize={18}
      />
    );
  };

  // Group products into pairs for horizontal paging
  function groupIntoPairs(arr: ProductItem[]) {
    const pairs = [];
    for (let i = 0; i < arr.length; i += 2) {
      pairs.push(arr.slice(i, i + 2));
    }
    return pairs;
  }

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
  }

  const bannerCollections = collections.filter(c => c.type === 'banner');
  const windowWidth = Dimensions.get('window').width;
  const cardMargin = 8;
  const cardWidth = (windowWidth * 0.9 - cardMargin * 3) / 2;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8F9FA' }} contentContainerStyle={{ paddingBottom: 24 }}>
      {/* Enhanced Banner Section */}
      <View style={styles.bannerSection}>
        <FlatList
          ref={bannerRef}
          data={bannerCollections}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          onScrollToIndexFailed={handleScrollToIndexFailed}
          keyExtractor={item => item.collection_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('StoreScreen', {
                  collectionId: item.collection_id,
                })
              }
              style={styles.bannerContainer}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)']}
                style={styles.bannerGradient}
              />
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Discover New Trends</Text>
                <Text style={styles.bannerSubtitle}>Shop the latest collection</Text>
                <TouchableOpacity style={styles.bannerButton}>
                  <Text style={styles.bannerButtonText}>Shop Now</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ marginTop: 16 }}
        />

        {/* Banner Pagination Dots */}
        {bannerCollections.length > 1 && (
          <View style={styles.paginationContainer}>
            {bannerCollections.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentBannerIndex.current && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Enhanced Categories Section */}
      <View style={styles.categoriesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={categories}
          keyExtractor={item => item.id.toString()}
          renderItem={renderCategory}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Enhanced Collections Section */}
      {collections
        .filter(collection => collection.type !== 'banner')
        .map(collection => {
          const productPairs = groupIntoPairs(collection.products);
          return (
            <View
              key={collection.collection_id}
              style={styles.collectionContainer}>
              <View style={styles.collectionHeader}>
                <Text style={styles.collectionTitle}>{collection.name}</Text>
                <TouchableOpacity style={styles.collectionButton}>
                  <Text style={styles.collectionButtonText}>View All</Text>
                  <Icon name="chevron-right" type="feather" size={16} color="#7B2FF2" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={productPairs}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item: pair }) => (
                  <View style={styles.productRow}>
                    {pair.map((productItem: ProductItem, idx: number) => (
                      <View key={productItem.product_id} style={[styles.productContainer, idx === 0 && pair.length === 2 && styles.productContainerLeft]}>
                        {renderProduct({ item: productItem })}
                      </View>
                    ))}
                  </View>
                )}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 8 }}
              />
            </View>
          );
        })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bannerSection: {
    marginBottom: 24,
  },
  bannerContainer: {
    height: 200,
    width: Dimensions.get('window').width,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 12,
    opacity: 0.9,
  },
  bannerButton: {
    backgroundColor: '#7B2FF2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#7B2FF2',
    width: 24,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#7B2FF2',
    fontWeight: '600',
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 100,
  },
  categoryImageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  collectionContainer: {
    marginBottom: 24,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  collectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionButtonText: {
    fontSize: 14,
    color: '#7B2FF2',
    fontWeight: '600',
    marginRight: 4,
  },
  productRow: {
    flexDirection: 'row',
    width: Dimensions.get('window').width * 0.9,
    justifyContent: 'flex-start',
    alignSelf: 'center',
  },
  productContainer: {
    width: (Dimensions.get('window').width * 0.9 - 16) / 2,
  },
  productContainerLeft: {
    marginRight: 16,
  },
});

export default CollectionSection;

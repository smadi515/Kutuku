import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../App';
import {useTranslation} from 'react-i18next';
import {getParentCategories} from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import ProductCard from './ProductCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCustomerCart, addItemToCart, updateCartItemQuantity } from '../lib/api';

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
  const {i18n} = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [quantity] = useState(1);

  const bannerRef = useRef<FlatList>(null);
  const currentBannerIndex = useRef(0);
  const renderCategory = ({item}: {item: Category}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('StoreScreen', {categoryId: item.id})}>
      <Image source={{uri: item.image}} style={styles.image} />
      <Text style={styles.name}>{item.name}</Text>
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

  const renderProduct = ({item}: {item: ProductItem}) => {
    const {product} = item;
    const {description, price, images, inventory} = product;
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
    return <ActivityIndicator size="large" style={{marginTop: 20}} />;
  }

  const bannerCollections = collections.filter(c => c.type === 'banner');
  const windowWidth = Dimensions.get('window').width;
  const cardMargin = 8;
  const cardWidth = (windowWidth * 0.9 - cardMargin * 3) / 2;

  return (
    <ScrollView style={{flex: 1, backgroundColor: '#F5F0FF'}} contentContainerStyle={{paddingBottom: 24}}>
      {/* Banner Section */}
      <FlatList
        ref={bannerRef}
        data={bannerCollections}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onScrollToIndexFailed={handleScrollToIndexFailed}
        keyExtractor={item => item.collection_id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('StoreScreen', {
                collectionId: item.collection_id,
              })
            }
            style={styles.bannerContainer}
          >
            <Image
              source={{uri: item.image}}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={{marginTop: 16}}
      />
      <View>
        <Text style={styles.title}>Categories</Text>
        <FlatList
          data={categories}
          keyExtractor={item => item.id.toString()}
          renderItem={renderCategory}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 12}}
        />
      </View>

      {/* Other Collections */}
      {collections
        .filter(collection => collection.type !== 'banner')
        .map(collection => {
          const productPairs = groupIntoPairs(collection.products);
          return (
            <View
              key={collection.collection_id}
              style={styles.collectionContainer}>
              <Text style={styles.collectionTitle}>{collection.name}</Text>
              <FlatList
                data={productPairs}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({item: pair}) => (
                  <View style={{flexDirection: 'row', width: windowWidth * 0.9, justifyContent: 'flex-start', alignSelf: 'center'}}>
                    {pair.map((productItem: ProductItem, idx: number) => (
                      <View key={productItem.product_id} style={{width: cardWidth, marginRight: idx === 0 && pair.length === 2 ? cardMargin : 0}}>
                        {renderProduct({item: productItem})}
                      </View>
                    ))}
                  </View>
                )}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingBottom: 8}}
              />
            </View>
          );
        })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
  },
  productInfo: {
    padding: 10,
  },
  collectionContainer: {
    marginVertical: 16,
    paddingHorizontal: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 6,
  },
  card: {
    alignItems: 'center',
    marginRight: 12,
    width: 100,
  },
  name: {
    fontSize: 12,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productCard: {
    marginRight: 12,
    width: 160,
  },
  imageWrapper: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'blcak',
  },
  outOfStock: {
    fontSize: 12,
    color: 'red',
    fontWeight: '500',
  },
  productShort: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  bannerContainer: {
    height: 180,
    width: Dimensions.get('window').width,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});

export default CollectionSection;

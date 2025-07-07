import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../App';
import {useTranslation} from 'react-i18next';
import {getParentCategories} from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  const rate = selectedCurrency ? currencyRates[selectedCurrency] || 1 : 1;
  const symbol = selectedCurrency
    ? currencySymbols[selectedCurrency] || ''
    : '';

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();
  const {i18n} = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);

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
    const loadSelectedCurrency = async () => {
      const saved = await AsyncStorage.getItem('selectedCurrency');
      if (saved) setSelectedCurrency(saved);
    };
    loadSelectedCurrency();
  }, []);
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Auto-scroll banner
  useEffect(() => {
    const interval = setInterval(() => {
      const banners = collections.filter(c => c.type === 'banner');
      if (!banners.length) return;
      currentBannerIndex.current =
        (currentBannerIndex.current + 1) % banners.length;
      bannerRef.current?.scrollToIndex({
        index: currentBannerIndex.current,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [collections]);

  const renderProduct = ({item}: {item: ProductItem}) => {
    const {product} = item;
    const {description, price, images, inventory} = product;
    const stockAvailability = inventory.stock_availability;
    const urlKey = product?.description?.url_key || '';

    const imageUri = images[0]?.origin_image || '';

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ProductsDetails', {url_key: urlKey})
        }
        style={styles.productCard}>
        <View style={styles.cardContainer}>
          <Image
            source={{uri: imageUri}}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1}>
              {description.name}
            </Text>
            <Text style={styles.productShort} numberOfLines={2}>
              {description.description || 'No description'}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>
                {symbol} {(price * rate).toFixed(2)}
              </Text>
              {!stockAvailability && (
                <Text style={styles.outOfStock}>Out of stock</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{marginTop: 20}} />;
  }

  const bannerCollections = collections.filter(c => c.type === 'banner');

  return (
    <View style={{flex: 1, backgroundColor: '#F5F0FF'}}>
      {/* Banner Section */}
      <FlatList
        ref={bannerRef}
        data={bannerCollections}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        keyExtractor={item => item.collection_id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('StoreScreen', {
                collectionId: item.collection_id,
              })
            }
            style={styles.bannerContainer}>
            <Image
              source={{uri: item.image}}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={{paddingHorizontal: 12, marginTop: 16}}
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
        .map(collection => (
          <View
            key={collection.collection_id}
            style={styles.collectionContainer}>
            <Text style={styles.collectionTitle}>{collection.name}</Text>
            <FlatList
              data={collection.products}
              keyExtractor={item => item.product_id.toString()}
              renderItem={renderProduct}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        ))}
    </View>
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
    width: 320,
    marginRight: 12,
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

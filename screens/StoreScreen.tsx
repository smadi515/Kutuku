import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Button,
  StatusBar,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import type {RootStackParamList} from '../App';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {
  getProducts,
  getSubcategories,
  getCustomerCart,
  addItemToCart,
} from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/icon';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'StoreScreen'
>;

type ProductImage = {
  is_main: boolean;
  listing_image: string;
  origin_image: string; // ✅ add this
};

type ProductDescription = {
  name?: string;
  description?: string;
  short_description?: string;
  url_key?: string;
};
type ExtendedProduct = Product & {
  urlKey: string;
  brandName: string;
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

type Category = {
  id: number;
  name: string;
  image: string;
};

const StoreScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'StoreScreen'>>();
  const [quantity] = useState(1); // No need to change quantity for now

  const categoryId = route.params?.categoryId;
  const brandId = route.params?.brandId;
  const [products, setProducts] = useState<ExtendedProduct[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    number | null
  >(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  const { currency, rate } = useCurrency();
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JOD: 'JD',
    SAR: '﷼',
  };
  const symbol = currencySymbols[currency] || '';

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!categoryId) return;
      try {
        const data = await getSubcategories(categoryId);
        setSubcategories(data);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
      }
    };
    fetchSubcategories();
  }, [categoryId]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoryIdNum =
          selectedSubcategoryId !== null ? selectedSubcategoryId : categoryId;

        const result = await getProducts(
          'en', // or i18n.language
          categoryIdNum,
          brandId,
          page,
          PAGE_SIZE,
        );

        const transformed = result.map((product: any) => {
          const mainImage =
            product.images?.find((img: ProductImage) => img.is_main) ||
            product.images?.[0];

          const desc: ProductDescription =
            typeof product.description === 'object'
              ? product.description
              : {
                  name: '',
                  description: '',
                  short_description: '',
                  url_key: '',
                };

          return {
            ...product,
            image: mainImage?.origin_image || '',
            name: desc.name || 'No name',
            description: desc.description || 'No description available',
            short_description: desc.short_description || '',
            urlKey: desc.url_key || '',
            brandName: product.brand?.name || '',
          };
        });

        setProducts(transformed);
        setHasMore(transformed.length === PAGE_SIZE); // assume more pages if full
      } catch (error) {
        console.error('Failed to load products:', error);
        setProducts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, selectedSubcategoryId, categoryId, brandId]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const categoryIdNum =
        selectedSubcategoryId !== null ? selectedSubcategoryId : categoryId;

      const result = await getProducts(
        'en', // or your current language
        categoryIdNum,
        brandId,
        page + 1, // next page
        PAGE_SIZE,
      );

      const transformed = result.map((product: any) => {
        const mainImage =
          product.images?.find((img: ProductImage) => img.is_main) ||
          product.images?.[0];

        const desc: ProductDescription =
          typeof product.description === 'object'
            ? product.description
            : {
                name: '',
                description: '',
                short_description: '',
                url_key: '',
              };

        return {
          ...product,
          image: mainImage?.origin_image || '',
          name: desc.name || 'No name',
          description: desc.description || 'No description available',
          short_description: desc.short_description || '',
          urlKey: desc.url_key || '',
          brandName: product.brand?.name || '',
        };
      });

      setProducts(prev => [...prev, ...transformed]);
      setPage(prev => prev + 1);
      setHasMore(transformed.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error loading more products:', error);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

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
      }

      if (!cart || !cart.cart_id) {
        console.error('Failed to get or create cart');
        return;
      }

      // 2. Add item to backend cart
      const backendResponse = await addItemToCart(
        token,
        item.product_id.toString(),
        quantity,
      );

      // 3. Add item to local cart
      const storedCart = await AsyncStorage.getItem('cart');
      const parsedCart = storedCart ? JSON.parse(storedCart) : [];

      const newItem = {
        id: item.product_id.toString(),
        title: item.name,
        price: item.price,
        quantity: quantity,
        selected: true,
        image: {uri: item.image},
        cart_item_id: backendResponse?.cart_item_id || null,
      };

      const updatedCart = [...parsedCart, newItem];
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));

      navigation.navigate('CartScreen');
    } catch (error) {
      console.error('Error in handleAddToCart:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7B2FF2" />
      <LinearGradient colors={["#7B2FF2", "#F357A8"]} style={styles.headerGradient}>
        <Header
          title="Store"
          showBack={true}
          showImage={false}
          rightIcons={[
            {
              name: 'cart-outline',
              type: 'Ionicons',
              onPress: () => navigation.navigate('CartScreen'),
            },
          ]}
        />
      </LinearGradient>
      {/* Subcategory Filter */}
      {categoryId && subcategories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subcategoryContainer}>
          <TouchableOpacity
            style={[styles.pillButton, selectedSubcategoryId === null && styles.pillButtonSelected]}
            onPress={() => setSelectedSubcategoryId(null)}>
            <Text style={[styles.pillButtonText, selectedSubcategoryId === null && styles.pillButtonTextSelected]}>All</Text>
          </TouchableOpacity>
          {subcategories.map(sub => (
            <TouchableOpacity
              key={sub.id}
              style={[styles.pillButton, selectedSubcategoryId === sub.id && styles.pillButtonSelected]}
              onPress={() => setSelectedSubcategoryId(sub.id)}>
              <Image
                source={{uri: sub.image}}
                style={styles.pillImage}
              />
              <Text style={[styles.pillButtonText, selectedSubcategoryId === sub.id && styles.pillButtonTextSelected]}>{sub.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {/* Products List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#7B2FF2"
          style={{marginTop: 20}}
        />
      ) : (
        <FlatList
          data={products}
          initialNumToRender={10}
          removeClippedSubviews={true}
          numColumns={2}
          keyExtractor={item => item.product_id.toString()}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={{padding: 16}}
          renderItem={({item}) => (
            <View style={styles.productCardWrapper}>
              <ProductCard
                product_id={item.product_id}
                urlKey={item.urlKey}
                title={item.name}
                designer={item.brandName}
                price={Math.round(item.price * rate)}
                currencySymbol={symbol}
                image={item.image ?? ''}
                description={item.description}
                stock_availability={item.inventory?.stock_availability ?? false}
                onPressCart={() => handleAddToCart(item)}
              />
            </View>
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" color="#7B2FF2" /> : null
          }
          ListEmptyComponent={!loading && <Text style={styles.emptyText}>No products found.</Text>}
        />
      )}
      <View style={styles.paginationRow}>
        <TouchableOpacity
          style={[styles.paginationBtn, page === 1 && styles.paginationBtnDisabled]}
          onPress={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
        >
          <Icon name="chevron-left" type="Feather" size={22} color={page === 1 ? '#ccc' : '#fff'} />
          <Text style={styles.paginationBtnText}>Previous</Text>
        </TouchableOpacity>
        <Text style={styles.pageNumber}>Page {page}</Text>
        <TouchableOpacity
          style={[styles.paginationBtn, !hasMore && styles.paginationBtnDisabled]}
          onPress={() => setPage(p => p + 1)}
          disabled={!hasMore}
        >
          <Text style={styles.paginationBtnText}>Next</Text>
          <Icon name="chevron-right" type="Feather" size={22} color={!hasMore ? '#ccc' : '#fff'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F7F7FB'},
  headerGradient: {
    width: '100%',
    paddingTop: 0,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: 8,
  },
  subcategoryContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    marginBottom: 10,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  pillButtonSelected: {
    backgroundColor: '#7B2FF2',
    borderColor: '#7B2FF2',
  },
  pillButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7B2FF2',
    marginLeft: 6,
  },
  pillButtonTextSelected: {
    color: '#fff',
  },
  pillImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 6,
    backgroundColor: '#eee',
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  productCardWrapper: {
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 18,
    elevation: 3,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 30,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 18,
    marginTop: 2,
  },
  paginationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7B2FF2',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.13,
    shadowRadius: 8,
  },
  paginationBtnDisabled: {
    backgroundColor: '#eee',
  },
  paginationBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    marginHorizontal: 4,
  },
  pageNumber: {
    fontSize: 16,
    color: '#7B2FF2',
    fontWeight: '700',
  },
});

export default StoreScreen;

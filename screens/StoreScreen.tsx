import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import type { RootStackParamList } from '../App';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getProducts,
  getSubcategories,
  getCustomerCart,
  addItemToCart,
  getParentCategories,
  getBrands,
} from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/icon';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';

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
  category_id?: number; // Added for category filtering
  brand?: { id: number; name: string }; // Added for brand filtering
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
  const initialSubcategoryId = route.params?.subcategoryId;
  const [products, setProducts] = useState<ExtendedProduct[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(initialSubcategoryId ?? null);
  const [page, setPage] = useState(1);

  const [searchText, setSearchText] = useState('');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<ExtendedProduct[]>([]);
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => [500], []); // Increased height
  const [cartCount, setCartCount] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;

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

  const screenWidth = Dimensions.get('window').width;
  const containerPadding = 32; // 16px on each side
  const cardSpacing = 12; // Space between cards
  const cardWidth = (screenWidth - containerPadding - cardSpacing) / 2; // 2 cards with proper spacing

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
        let categoryIdNum: number | undefined;
        if (categoryId) {
          // Always use categoryId if present and no subcategory selected
          categoryIdNum = selectedSubcategoryId !== null ? selectedSubcategoryId : categoryId;
        } else {
          categoryIdNum = selectedCategory !== null ? selectedCategory : undefined;
        }
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
  }, [page, selectedSubcategoryId, categoryId, brandId, selectedCategory]);

  useEffect(() => {
    getParentCategories()
      .then(data => {
        console.log('Fetched categories:', data);
        setCategories(data);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setCategories([]);
      });
    getBrands()
      .then(data => {
        console.log('Fetched brands:', data);
        setBrands(data);
      })
      .catch(err => {
        console.error('Error fetching brands:', err);
        setBrands([]);
      });
  }, []);

  // When categoryId changes, set selectedSubcategoryId and selectedCategory to categoryId (for pill selection and filter)
  useEffect(() => {
    if (categoryId !== undefined && categoryId !== null) {
      setSelectedSubcategoryId(categoryId);
      setSelectedCategory(categoryId);
    }
  }, [categoryId]);

  // If subcategoryId param changes (e.g., navigating from home), update selectedSubcategoryId
  useEffect(() => {
    if (initialSubcategoryId !== undefined && initialSubcategoryId !== null) {
      setSelectedSubcategoryId(initialSubcategoryId);
    }
  }, [initialSubcategoryId]);

  // Reset subcategory selection when categoryId changes
  useEffect(() => {
    setSelectedSubcategoryId(null);
  }, [categoryId]);

  // Load cart count every time StoreScreen is focused
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

  // Debounced live search effect
  useEffect(() => {
    // Only filter if not using the filter sheet (i.e., when not applying advanced filters)
    // This effect will run on every searchText change
    const handler = setTimeout(() => {
      let result = [...products];
      if (searchText.length >= 3) {
        result = result.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()));
      }
      setFilteredProducts(result);
    }, 400); // 400ms debounce
    return () => clearTimeout(handler);
  }, [searchText, products]);



  const handleScroll = useCallback((event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 50 && showFilters) {
      setShowFilters(false);
    } else if (offsetY <= 50 && !showFilters) {
      setShowFilters(true);
    }
  }, [showFilters]);

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
        image: { uri: item.image },
        cart_item_id: backendResponse?.cart_item_id || null,
      };

      const updatedCart = [...parsedCart, newItem];
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
      setCartCount(updatedCart.length);
      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${item.name} has been added to your cart.`,
      });
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

  // Filtering logic (runs only when Apply is pressed)
  const applyFilters = async () => {
    setLoading(true);
    setPage(1); // Reset to first page when filters are applied
    try {
      let categoryIdNum: number | undefined;
      if (selectedCategory !== null) {
        categoryIdNum = selectedCategory;
      } else if (categoryId) {
        categoryIdNum = selectedSubcategoryId !== null ? selectedSubcategoryId ?? undefined : categoryId;
      }
      const result = await getProducts(
        'en',
        categoryIdNum,
        selectedBrand !== null ? selectedBrand : undefined,
        1, // always fetch first page on filter
        PAGE_SIZE,
      );
      let filtered = result.map((product: any) => {
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
      // Only apply searchText locally
      if (searchText.length >= 3) {
        filtered = filtered.filter((p: ExtendedProduct) => p.name.toLowerCase().includes(searchText.toLowerCase()));
      }
      // Sort
      if (sortOrder === 'asc') {
        filtered = filtered.sort((a: ExtendedProduct, b: ExtendedProduct) => a.price - b.price);
      } else {
        filtered = filtered.sort((a: ExtendedProduct, b: ExtendedProduct) => b.price - a.price);
      }
      setProducts(filtered);
      setFilteredProducts(filtered);
      setHasMore(filtered.length === PAGE_SIZE);
    } catch (error) {
      setProducts([]);
      setFilteredProducts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      bottomSheetRef.current?.close();
    }
  };

  const renderProductItem = useCallback(({ item, index }: { item: ExtendedProduct; index: number }) => {
    // If odd number of products, last item should not stretch
    const isLastOdd = filteredProducts.length % 2 === 1 && index === filteredProducts.length - 1;
    return (
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
        cardWidth={cardWidth}
      />
    );
  }, [filteredProducts, rate, symbol, cardWidth, handleAddToCart]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.headerContainer}>
        <Header
          title="Store"
          showImage={false}
          rightIcons={[{
            name: 'cart-outline',
            type: 'Ionicons',
            onPress: () => navigation.navigate('CartScreen'),
            render: () => (
              <View style={{ position: 'relative' }}>
                <Icon name="cart-outline" type="Ionicons" size={24} color="#333" />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>
            )
          }]}
        />
      </View>
      <Animated.View style={[
        styles.filtersContainer,
        {
          opacity: showFilters ? 1 : 0,
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [0, 50],
              outputRange: [0, -100],
              extrapolate: 'clamp',
            })
          }],
          height: showFilters ? 'auto' : 0,
        }
      ]}>
        {categoryId && subcategories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.subcategoryContainer}
            nestedScrollEnabled={true}
          >
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
                  source={{ uri: sub.image }}
                  style={styles.pillImage}
                />
                <Text
                  style={[
                    styles.pillButtonText,
                    selectedSubcategoryId === sub.id && styles.pillButtonTextSelected
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {sub.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {!categoryId && categories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.subcategoryContainer}
            nestedScrollEnabled={true}
          >
            <TouchableOpacity
              style={[styles.pillButton, selectedCategory === null && styles.pillButtonSelected]}
              onPress={() => setSelectedCategory(null)}>
              <Text style={[styles.pillButtonText, selectedCategory === null && styles.pillButtonTextSelected]}>All</Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.pillButton, selectedCategory === cat.id && styles.pillButtonSelected]}
                onPress={() => setSelectedCategory(cat.id)}>
                <Image
                  source={{ uri: cat.image }}
                  style={styles.pillImage}
                />
                <Text
                  style={[
                    styles.pillButtonText,
                    selectedCategory === cat.id && styles.pillButtonTextSelected
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, zIndex: 1, paddingHorizontal: 16 }}>
          <View style={[styles.searchBar, { flex: 1 }]}>
            <Icon type="ant" name="search1" size={20} style={{ marginRight: 12, color: '#999' }} />
            <TextInput
              placeholder={'Search products...'}
              style={styles.searchInput}
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity
              onPress={() => bottomSheetRef.current?.snapToIndex(0)}
              style={{ padding: 4 }}
            >
              <Icon type="ant" name="filter" size={20} color="#333333" />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#F8F8F8', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <ActivityIndicator
              size="large"
              color="#333333"
            />
          </View>
          <Text style={{ color: '#333', fontWeight: '700', fontSize: 18, marginBottom: 8 }}>Loading products</Text>
          <Text style={{ color: '#666', fontSize: 14 }}>Please wait while we fetch the latest items...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          initialNumToRender={10}
          removeClippedSubviews={true}
          numColumns={2}
          keyExtractor={item => item.product_id.toString()}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, minHeight: 200 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          renderItem={renderProductItem}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" color="#333333" /> : null
          }
          ListEmptyComponent={!loading && (
            <View style={{ alignItems: 'center', marginTop: 60, paddingHorizontal: 32 }}>
              <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#F8F8F8', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <Icon name="search1" type="ant" size={32} color="#999" />
              </View>
              <Text style={{ color: '#333', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>No products found</Text>
              <Text style={{ color: '#666', fontSize: 16, textAlign: 'center', lineHeight: 24 }}>
                Try adjusting your filters or search keywords to find what you're looking for.
              </Text>
            </View>
          )}
        />
      )}

      {!filterSheetVisible && (
        <View style={[styles.paginationRow, { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#FFFFFF', paddingBottom: 20, zIndex: 10, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' }]}>
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[styles.pageButton, styles.navButton, page === 1 && styles.pageButtonDisabled]}
              onPress={() => setPage(p => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              <Icon name="chevron-left" type="Feather" size={16} color={page === 1 ? '#999' : '#333'} />
            </TouchableOpacity>

            {/* Always show page 1 */}
            <TouchableOpacity
              style={[styles.pageButton, page === 1 && styles.pageButtonActive]}
              onPress={() => setPage(1)}
            >
              <Text style={[styles.pageButtonText, page === 1 && styles.pageButtonTextActive]}>1</Text>
            </TouchableOpacity>

            {/* Show current page if it's not 1 */}
            {page > 1 && (
              <TouchableOpacity
                style={[styles.pageButton, styles.pageButtonActive]}
                onPress={() => setPage(page)}
              >
                <Text style={[styles.pageButtonText, styles.pageButtonTextActive]}>{page}</Text>
              </TouchableOpacity>
            )}

            {/* Show next page if there are more pages */}
            {hasMore && page < 2 && (
              <TouchableOpacity
                style={styles.pageButton}
                onPress={() => setPage(page + 1)}
              >
                <Text style={styles.pageButtonText}>{page + 1}</Text>
              </TouchableOpacity>
            )}

            {/* Show ellipsis if there are more pages after current */}
            {hasMore && (
              <View style={styles.pageButton}>
                <Text style={styles.pageButtonText}>...</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.pageButton, styles.navButton, !hasMore && styles.pageButtonDisabled]}
              onPress={() => setPage(p => p + 1)}
              disabled={!hasMore}
            >
              <Icon name="chevron-right" type="Feather" size={16} color={!hasMore ? '#999' : '#333'} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={index => setFilterSheetVisible(index !== -1)}
      >
        <BottomSheetView style={{ padding: 20, flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Filter Products</Text>

            <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Sort by Price</Text>
            <View style={{ flexDirection: 'row', marginVertical: 8 }}>
              <TouchableOpacity onPress={() => setSortOrder('asc')} style={[styles.filterOption, sortOrder === 'asc' && styles.selectedFilterOption]}>
                <Text>Lowest to Highest</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSortOrder('desc')} style={[styles.filterOption, sortOrder === 'desc' && styles.selectedFilterOption]}>
                <Text>Highest to Lowest</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Category</Text>
            <View style={{ marginVertical: 8, minHeight: 56, maxHeight: 120, backgroundColor: '#F7F0FF', borderRadius: 12, borderWidth: 1, borderColor: '#E0D7F7', paddingVertical: 6, paddingHorizontal: 4 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 6 }} nestedScrollEnabled={true}>
                <TouchableOpacity onPress={() => setSelectedCategory(selectedCategory === null ? null : null)} style={[styles.filterOption, { marginRight: 10 }, selectedCategory === null && styles.selectedFilterOption]}>
                  <Text>All Categories</Text>
                </TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity key={cat.id} onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)} style={[styles.filterOption, { marginRight: 10 }, selectedCategory === cat.id && styles.selectedFilterOption]}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={{ maxWidth: 80 }}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Brand</Text>
            <View style={{ marginVertical: 8, minHeight: 56, maxHeight: 120, backgroundColor: '#F7F0FF', borderRadius: 12, borderWidth: 1, borderColor: '#E0D7F7', paddingVertical: 6, paddingHorizontal: 4 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 6 }} nestedScrollEnabled={true}>
                <TouchableOpacity onPress={() => setSelectedBrand(selectedBrand === null ? null : null)} style={[styles.filterOption, { marginRight: 10 }, selectedBrand === null && styles.selectedFilterOption]}>
                  <Text>All Brands</Text>
                </TouchableOpacity>
                {brands.map(brand => (
                  <TouchableOpacity key={brand.id} onPress={() => setSelectedBrand(selectedBrand === brand.id ? null : brand.id)} style={[styles.filterOption, { marginRight: 10 }, selectedBrand === brand.id && styles.selectedFilterOption]}>
                    <Text>{brand.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity onPress={applyFilters} style={[styles.applyButton, { marginTop: 24 }]}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Apply</Text>
            </TouchableOpacity>
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerContainer: {
    width: '100%',
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 0,
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  subcategoryContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    minWidth: 60,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    elevation: 3,
    shadowColor: '#333333',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
  },
  pillButtonSelected: {
    backgroundColor: '#333333',
    borderColor: '#333333',
    elevation: 4,
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  pillButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginLeft: 8,
    flexShrink: 0,
  },
  pillButtonTextSelected: {
    color: '#FFFFFF',
  },
  pillImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#F8F8F8',
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingHorizontal: 0,
    width: '100%',
    gap: 12,
  },

  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 30,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 18,
    marginTop: 2,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  paginationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#333333',
    shadowOpacity: 0.13,
    shadowRadius: 8,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  navButton: {
    width: 40,
    height: 40,
  },
  pageButtonActive: {
    backgroundColor: '#333333',
    borderColor: '#333333',
  },
  pageButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  pageButtonTextActive: {
    color: '#FFFFFF',
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
    color: '#333333',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 16,
    width: '100%',
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  filterOption: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E0D7F7',
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFilterOption: {
    backgroundColor: '#333333',
    borderColor: '#333333',
  },
  applyButton: {
    backgroundColor: '#333333',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    elevation: 2,
    shadowColor: '#333333',
    shadowOpacity: 0.13,
    shadowRadius: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default StoreScreen;

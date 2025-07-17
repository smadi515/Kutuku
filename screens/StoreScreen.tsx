import React, { useEffect, useState, useCallback } from 'react';
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
} from 'react-native';
import {useNavigation, useRoute, RouteProp, useFocusEffect} from '@react-navigation/native';
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
  getParentCategories,
  getBrands,
} from '../lib/api';
import { useCurrency } from '../contexts/CurrencyContext';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/icon';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
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
  const [selectedCategory, setSelectedCategory] = useState<number|null>(null);
  const [selectedBrand, setSelectedBrand] = useState<number|null>(null);
  const [filteredProducts, setFilteredProducts] = useState<ExtendedProduct[]>([]);
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = React.useMemo(() => [500], []); // Increased height
  const [cartCount, setCartCount] = useState(0);

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
  const cardMargin = 12;
  const cardWidth = (screenWidth - cardMargin * 4) / 2; // 2 cards, 3 margins

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

  const renderProductItem = useCallback(({item, index}: {item: ExtendedProduct; index: number}) => {
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
      <StatusBar barStyle="light-content" backgroundColor="#7B2FF2" />
      <LinearGradient colors={["#7B2FF2", "#F357A8"]} style={[styles.headerGradient, {marginTop: 18}]}>
        <Header
          title="Store"
          showImage={false}
          rightIcons={[{
            name: 'cart-outline',
            type: 'Ionicons',
            onPress: () => navigation.navigate('CartScreen'),
            render: () => (
              <View style={{position: 'relative'}}>
                <Icon name="cart-outline" type="Ionicons" size={24} color="#000" />
                {cartCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>{cartCount}</Text>
                  </View>
                )}
              </View>
            )
          }]}
        />
      </LinearGradient>
      <View>
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
                  source={{uri: sub.image}}
                  style={styles.pillImage}
                />
                <Text
                  style={[
                    styles.pillButtonText,
                    selectedSubcategoryId === sub.id && styles.pillButtonTextSelected,
                    {maxWidth: 60, flexShrink: 1}
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
                  source={{uri: cat.image}}
                  style={styles.pillImage}
                />
                <Text
                  style={[
                    styles.pillButtonText,
                    selectedCategory === cat.id && styles.pillButtonTextSelected,
                    {maxWidth: 60, flexShrink: 1}
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
        
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 18, zIndex: 1, paddingHorizontal: 8}}>
          <View style={[styles.searchBar, {flex: 1}]}> 
            <Icon type="ant" name="search1" size={20} style={{marginRight: 8}} />
            <TextInput
              placeholder={'Search products'}
              style={styles.searchInput}
              placeholderTextColor="#aaa"
              value={searchText}
              onChangeText={setSearchText}
            />
            <TouchableOpacity onPress={() => bottomSheetRef.current?.snapToIndex(0)}>
              <Icon type="ant" name="filter" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200}}>
          <ActivityIndicator
            size="large"
            color="#7B2FF2"
            style={{marginTop: 20}}
          />
          <Text style={{marginTop: 16, color: '#7B2FF2', fontWeight: '600', fontSize: 16}}>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          initialNumToRender={10}
          removeClippedSubviews={true}
          numColumns={2}
          keyExtractor={item => item.product_id.toString()}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={{padding: 16, paddingBottom: 90, minHeight: 200}}
          renderItem={renderProductItem}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" color="#7B2FF2" /> : null
          }
          ListEmptyComponent={!loading && (
            <View style={{alignItems: 'center', marginTop: 40}}>
              <Icon name="search1" type="ant" size={40} color="#bbb" />
              <Text style={{color: '#888', fontSize: 18, fontWeight: '600', marginTop: 12}}>No products found.</Text>
              <Text style={{color: '#aaa', fontSize: 14, marginTop: 4, textAlign: 'center', maxWidth: 220}}>
                Try adjusting your filters or search keywords.
              </Text>
            </View>
          )}
        />
      )}
      
      {!filterSheetVisible && (
        <View style={[styles.paginationRow, {position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#F7F7FB', paddingBottom: 18, zIndex: 10, paddingTop: 16}]}> 
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
      )}
    
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={index => setFilterSheetVisible(index !== -1)}
      >
        <BottomSheetView style={{padding: 20, flex: 1}}>
          <ScrollView contentContainerStyle={{paddingBottom: 32}} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Filter Products</Text>
         
            <Text style={{marginTop: 16, fontWeight: 'bold'}}>Sort by Price</Text>
            <View style={{flexDirection: 'row', marginVertical: 8}}>
              <TouchableOpacity onPress={() => setSortOrder('asc')} style={[styles.filterOption, sortOrder === 'asc' && styles.selectedFilterOption]}>
                <Text>Lowest to Highest</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSortOrder('desc')} style={[styles.filterOption, sortOrder === 'desc' && styles.selectedFilterOption]}>
                <Text>Highest to Lowest</Text>
              </TouchableOpacity>
            </View>
           
            <Text style={{marginTop: 16, fontWeight: 'bold'}}>Category</Text>
            <View style={{marginVertical: 8, minHeight: 56, maxHeight: 120, backgroundColor: '#F7F0FF', borderRadius: 12, borderWidth: 1, borderColor: '#E0D7F7', paddingVertical: 6, paddingHorizontal: 4}}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{alignItems: 'center', paddingHorizontal: 6}} nestedScrollEnabled={true}>
                <TouchableOpacity onPress={() => setSelectedCategory(selectedCategory === null ? null : null)} style={[styles.filterOption, {marginRight: 10}, selectedCategory === null && styles.selectedFilterOption]}>
                  <Text>All Categories</Text>
                </TouchableOpacity>
                {categories.map(cat => (
                  <TouchableOpacity key={cat.id} onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)} style={[styles.filterOption, {marginRight: 10}, selectedCategory === cat.id && styles.selectedFilterOption]}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={{maxWidth: 80}}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
           
            <Text style={{marginTop: 16, fontWeight: 'bold'}}>Brand</Text>
            <View style={{marginVertical: 8, minHeight: 56, maxHeight: 120, backgroundColor: '#F7F0FF', borderRadius: 12, borderWidth: 1, borderColor: '#E0D7F7', paddingVertical: 6, paddingHorizontal: 4}}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{alignItems: 'center', paddingHorizontal: 6}} nestedScrollEnabled={true}>
                <TouchableOpacity onPress={() => setSelectedBrand(selectedBrand === null ? null : null)} style={[styles.filterOption, {marginRight: 10}, selectedBrand === null && styles.selectedFilterOption]}>
                  <Text>All Brands</Text>
                </TouchableOpacity>
                {brands.map(brand => (
                  <TouchableOpacity key={brand.id} onPress={() => setSelectedBrand(selectedBrand === brand.id ? null : brand.id)} style={[styles.filterOption, {marginRight: 10}, selectedBrand === brand.id && styles.selectedFilterOption]}>
                    <Text>{brand.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <TouchableOpacity onPress={applyFilters} style={[styles.applyButton, {marginTop: 24}]}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>Apply</Text>
            </TouchableOpacity>
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>
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
    paddingHorizontal: 10,
    paddingTop: 12,
    marginBottom: 8,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    minWidth: 80,
    maxWidth: 140,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  pillButtonSelected: {
    backgroundColor: '#7B2FF2',
    borderColor: '#7B2FF2',
  },
  pillButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7B2FF2',
    marginLeft: 6,
    flexShrink: 1,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#7B2FF2',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    width: '90%',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7B2FF2',
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
    backgroundColor: '#7B2FF2',
    borderColor: '#7B2FF2',
  },
  applyButton: {
    backgroundColor: '#7B2FF2',
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    elevation: 2,
    shadowColor: '#7B2FF2',
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

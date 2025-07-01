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
  const [allProducts, setAllProducts] = useState<ExtendedProduct[]>([]);
  const [, setProducts] = useState<ExtendedProduct[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    number | null
  >(null);
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;
  const displayedProducts = allProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const totalPages = Math.ceil(allProducts.length / PAGE_SIZE);
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
        const categoryIdStr =
          selectedSubcategoryId !== null
            ? selectedSubcategoryId.toString()
            : categoryId !== undefined
            ? categoryId.toString()
            : undefined;

        const brandIdVal = brandId;

        const result = await getProducts(categoryIdStr!, brandIdVal);

        const transformed = result.map((product: any) => {
          const mainImage =
            product.images?.find((img: ProductImage) => img.is_main) ||
            product.images?.[0];
          console.log('Transformed product:', product);

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

        setAllProducts(transformed);
        setProducts(transformed.slice(0, PAGE_SIZE));
        setHasMore(transformed.length > PAGE_SIZE);
      } catch (error) {
        console.error('Failed to load products:', error);
        setAllProducts([]);
        setProducts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSubcategoryId, categoryId, brandId]);
  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    setTimeout(() => {
      setProducts(prevProducts => {
        const nextProducts = allProducts.slice(
          prevProducts.length,
          prevProducts.length + PAGE_SIZE,
        );
        if (nextProducts.length < PAGE_SIZE) {
          setHasMore(false); // no more products to load
        }
        return [...prevProducts, ...nextProducts];
      });
      setLoadingMore(false);
    }, 500); // optional delay
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
  const toggleFavorite = async (productId: string) => {
    try {
      let updatedFavorites = favorites.includes(productId)
        ? favorites.filter(id => id !== productId)
        : [...favorites, productId];
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  return (
    <View style={styles.container}>
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
      {/* Subcategory Filter */}
      {categoryId && subcategories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subcategoryContainer}>
          <TouchableOpacity
            style={styles.subcategoryButton}
            onPress={() => setSelectedSubcategoryId(null)}>
            <View
              style={[
                styles.circle,
                selectedSubcategoryId === null && styles.circleSelected,
              ]}>
              <Text
                style={[
                  styles.subcategoryText,
                  selectedSubcategoryId === null && styles.textSelected,
                ]}>
                All
              </Text>
            </View>
          </TouchableOpacity>

          {subcategories.map(sub => (
            <TouchableOpacity
              key={sub.id}
              style={styles.subcategoryButton}
              onPress={() => setSelectedSubcategoryId(sub.id)}>
              <Image
                source={{uri: sub.image}}
                style={[
                  styles.subcategoryImage,
                  selectedSubcategoryId === sub.id &&
                    styles.circleSelectedBorder,
                ]}
              />
              <Text
                style={[
                  styles.subcategoryText,
                  selectedSubcategoryId === sub.id && styles.textSelected,
                ]}>
                {sub.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      {/* Products List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="purple"
          style={{marginTop: 20}}
        />
      ) : (
        <FlatList
          data={displayedProducts}
          numColumns={2}
          keyExtractor={item => item.product_id.toString()}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={{padding: 16}}
          renderItem={({item}) => (
            <ProductCard
              product_id={item.product_id}
              urlKey={item.urlKey}
              title={item.name}
              designer={item.brandName}
              price={item.price}
              image={item.image ?? ''}
              description={item.description}
              stock_availability={item.inventory?.stock_availability ?? false}
              isFavorite={favorites.includes(item.product_id.toString())}
              onPressFavorite={() => toggleFavorite(item.product_id.toString())}
              onPressCart={() => handleAddToCart(item)}
            />
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" /> : null
          }
        />
      )}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 16,
        }}>
        <Button
          title="Previous"
          onPress={() => setPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
        />
        <Text>
          Page {page} of {totalPages}
        </Text>
        <Button
          title="Next"
          onPress={() => setPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7f7'},
  subcategoryContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 8,
  },
  subcategoryButton: {
    alignItems: 'center',
    marginRight: 16,
  },
  circle: {
    width: 60,
    height: 60,
    backgroundColor: 'white',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: {
    backgroundColor: 'purple',
  },
  circleSelectedBorder: {
    borderWidth: 2,
    borderColor: 'purple',
  },
  subcategoryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  textSelected: {
    color: 'white',
  },
  subcategoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 4,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});

export default StoreScreen;

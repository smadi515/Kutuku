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
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import type {RootStackParamList} from '../App';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {getProducts, getSubcategories} from '../lib/api';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'StoreScreen'
>;

type ProductImage = {
  is_main: boolean;
  listing_image: string;
};

type ProductDescription = {
  name?: string;
  description?: string;
  short_description?: string;
};

type Product = {
  product_id: number;
  name: string;
  short_description: string;
  description: string;
  price: number;
  stock_availability: boolean;
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

  const categoryId = route.params?.categoryId;
  const brandId = route.params?.brandId;

  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<
    number | null
  >(null);

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
        const result = await getProducts(
          selectedSubcategoryId || categoryId,
          brandId,
        );

        const transformed = result.map((product: Product) => {
          const mainImage =
            product.images?.find(img => img.is_main) || product.images?.[0];
          let desc: ProductDescription = {};
          if (
            typeof product.description === 'object' &&
            product.description !== null
          ) {
            desc = product.description;
          }

          return {
            ...product,
            image: mainImage?.listing_image || '',
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

    fetchData();
  }, [selectedSubcategoryId, categoryId, brandId]);

  const handleAddToCart = async (product: Product) => {
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];
      const index = cart.findIndex(
        (item: any) => item.product_id === product.product_id,
      );

      if (index >= 0) {
        cart[index].quantity += 1;
      } else {
        cart.push({...product, quantity: 1});
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      navigation.navigate('CartScreen');
    } catch (error) {
      console.error('Error adding to cart:', error);
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
          data={products}
          numColumns={2}
          keyExtractor={item => item.product_id.toString()}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={{padding: 16}}
          renderItem={({item}) => (
            <ProductCard
              title={item.name}
              designer={item.short_description}
              price={item.price}
              image={item.image ?? ''}
              isFavorite={favorites.includes(item.product_id.toString())}
              onPressFavorite={() => toggleFavorite(item.product_id.toString())}
              onPressCart={() => handleAddToCart(item)}
              stock={item.stock_availability}
              description={item.description}
              product_id={item.product_id}
            />
          )}
        />
      )}
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

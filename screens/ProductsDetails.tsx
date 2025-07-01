import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import Icon from '../components/icon';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCustomerCart,
  addItemToCart,
  getProductByUrlKey,
  updateCartItemQuantity,
} from '../lib/api';
import {useTranslation} from 'react-i18next';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Toast from 'react-native-toast-message';
interface Review {
  review_id: number;
  customer: {
    first_name: string;
    last_name: string;
  };
  rating: number;
  review_text: string;
}
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
  name?: string;
  description?: string;
  short_description?: string;
};
type ProductImage = {
  is_main: boolean;
  listing_image: string;
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
type BackendCartItem = {
  product_id: number | string;
  cart_item_id: number;
  quantity: number;
  // add other relevant fields if you have them
};
const ProductsDetails = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductsDetails'>>();
  const {product_id} = route.params;
  const urlKey = route.params.url_key;
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['40%'], []);
  const OpenRatingProduct = () => bottomSheetRef.current?.expand();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // Fetch product
        const data = await getProductByUrlKey(urlKey, i18n.language);
        setProduct(data);
        console.log('Fetched product:', data);

        // Fetch reviews
        const response = await fetch(
          `https://api.sareh-nomow.xyz/api/reviews/product/${product_id}`,
        );
        if (!response.ok) throw new Error('Failed to fetch reviews');

        const reviews = await response.json();
        setReviews(reviews);
        console.log('response', reviews);

        // Calculate average rating
        if (Array.isArray(reviews) && reviews.length > 0) {
          const total = reviews.reduce((sum, review) => sum + review.rating, 0);
          const average = total / reviews.length;
          setAverageRating(Number(average.toFixed(1)));
        } else {
          setAverageRating(null);
        }
      } catch (error) {
        console.error('Error fetching product or reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [urlKey, product_id, i18n.language]);

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async (item: Product) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.warn('User not logged in');
        return;
      }

      let cart = await getCustomerCart(token);
      if (!cart || !cart.cart_id) {
        console.error('Failed to get or create cart');
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
          console.error('Missing cart_item_id');
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

        const newItem: LocalCartItem = {
          id: item.product_id.toString(),
          title: item.name,
          price: item.price,
          quantity: quantity,
          selected: true,
          image: {uri: item.image ?? ''},
          cart_item_id: backendResponse?.cart_item_id || null,
        };

        parsedCart.push(newItem);
      }

      await AsyncStorage.setItem('cart', JSON.stringify(parsedCart));
      navigation.navigate('CartScreen');
    } catch (error: any) {
      console.error('Error in handleAddToCart:', error);
      Toast.show({
        type: 'error',
        text1: 'Add to Cart Failed',
        text2: 'The quantity must not be greater',
        position: 'top',
      });
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="purple" style={{marginTop: 40}} />
    );
  }

  if (!product) {
    return <Text style={{padding: 20}}>Product not found</Text>;
  }
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={
            i <= rating
              ? 'star'
              : i - 0.5 <= rating
              ? 'star-half-full'
              : 'star-outline'
          }
          type="MaterialCommunityIcons"
          size={20}
          color="#FFD700"
        />,
      );
    }
    return stars;
  };

  return (
    <View style={{flex: 1, backgroundColor: '#F5F0FF'}}>
      <Header
        title={t('productDetails.headerTitle')}
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
      <ScrollView
        style={[styles.container, {direction: isRTL ? 'rtl' : 'ltr'}]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}>
          {product.images?.map((image: any, index: number) => (
            <Image
              key={index}
              source={{uri: image.origin_image}}
              style={styles.productImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        <View style={styles.detailsContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{product.description?.name}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={decreaseQuantity}>
                <Icon name="minus" type="ant" size={16} color="#333" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity onPress={increaseQuantity}>
                <Icon name="plus" type="ant" size={16} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.priceText}>
            {product.price ? `$${product.price.toFixed(2)}` : 'N/A'}
          </Text>
          <Text style={styles.stockText}>qty:{product.inventory?.qty}</Text>
          <Text style={styles.stockText}>
            {product.inventory?.stock_availability
              ? t('productDetails.stockIn')
              : t('productDetails.stockOut')}
          </Text>
          <TouchableOpacity onPress={OpenRatingProduct}>
            <View style={styles.ratingContainer}>
              {averageRating ? (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {renderStars(averageRating)}
                  <Text style={styles.ratingText}> {averageRating}</Text>
                </View>
              ) : (
                <Text style={styles.ratingText}>No reviews yet</Text>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>
            {t('productDetails.descriptionTitle')}
          </Text>
          <Text style={styles.descriptionText}>
            <Text>{product.description?.description}</Text>
          </Text>
          {/* Attributes Section */}
          {product.attributes && product.attributes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                {t('productDetails.attributesTitle')}
              </Text>
              {product.attributes.map((attr: any, index: number) => (
                <View key={index} style={styles.attributeRow}>
                  <Text style={styles.attributeLabel}>
                    {attr.attribute?.attribute_name ||
                      t('productDetails.attributeLabel')}
                    :
                  </Text>
                  <Text style={styles.attributeValue}>
                    {attr.option?.option_text ||
                      t('productDetails.attributeValueNA')}
                  </Text>
                </View>
              ))}
            </>
          )}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => handleAddToCart(product)}>
            <Text style={styles.cartButtonText}>
              {t('productDetails.addToCart')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{paddingHorizontal: 20}}>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 10}}>
            Product Reviews
          </Text>
          {reviews.length === 0 ? (
            <Text>No reviews yet.</Text>
          ) : (
            reviews.map(review => (
              <View key={review.review_id} style={{marginBottom: 15}}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View style={styles.reviewstyle}></View>
                </View>
                <View style={{flexDirection: 'row', marginVertical: 5}}>
                  {renderStars(review.rating)}
                </View>
                {review.review_text ? (
                  <Text style={{fontSize: 14}}>{review.review_text}</Text>
                ) : (
                  <Text
                    style={{fontSize: 14, fontStyle: 'italic', color: '#888'}}>
                    No comment
                  </Text>
                )}
              </View>
            ))
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  reviewstyle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  ratingText: {
    fontSize: 16,
    marginLeft: 6,
    color: '#444',
    fontWeight: '500',
  },
  container: {flex: 1, backgroundColor: '#fff'},
  imageScroll: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  productImage: {width: 300, height: 300, marginRight: 10},
  detailsContainer: {padding: 16},
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {fontSize: 22, fontWeight: 'bold', flex: 1, flexWrap: 'wrap'},
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityText: {marginHorizontal: 10, fontSize: 16},
  priceText: {fontSize: 20, color: 'black', marginVertical: 10},
  stockText: {color: '#888', marginBottom: 10},
  sectionTitle: {fontSize: 18, fontWeight: 'bold', marginTop: 20},
  descriptionText: {fontSize: 14, color: '#444', marginTop: 8},
  attributeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  attributeLabel: {
    fontWeight: 'bold',
    color: '#333',
    marginRight: 6,
  },
  attributeValue: {
    color: '#555',
    flexShrink: 1,
  },
  cartButton: {
    backgroundColor: 'purple',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductsDetails;

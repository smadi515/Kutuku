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
  createCart,
  addItemToCart,
  getProductById,
} from '../lib/api';
import {useTranslation} from 'react-i18next';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
interface Review {
  review_id: number;
  customer: {
    first_name: string;
    last_name: string;
  };
  rating: number;
  review_text: string;
}

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
const ProductsDetails = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductsDetails'>>();
  const {product_id} = route.params;
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
      try {
        const data = await getProductById(product_id);
        setProduct(data);

        const reviewsRes = await fetch(
          `https://api.sareh-nomow.xyz/api/reviews/product/${product_id}`,
        );
        const reviews = await reviewsRes.json();
        setReviews(reviews);

        if (Array.isArray(reviews) && reviews.length > 0) {
          const totalRating = reviews.reduce(
            (sum, review) => sum + review.rating,
            0,
          );
          setAverageRating(Number((totalRating / reviews.length).toFixed(1)));
        } else {
          setAverageRating(null);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching product or reviews:', err);
        setLoading(false);
      }
    };

    fetchProductData();
  }, [product_id]);
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

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
        cart = await createCart(token);
      }

      if (!cart || !cart.cart_id) {
        console.error('Failed to get or create cart');
        return;
      }

      // 2. Add item to backend cart
      const backendResponse = await addItemToCart(
        token,
        cart.cart_id,
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
    <View style={{flex: 1}}>
      <ScrollView
        style={[styles.container, {direction: isRTL ? 'rtl' : 'ltr'}]}>
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

        {/* Image Slider */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}>
          {product.images?.map((image: any, index: number) => (
            <Image
              key={index}
              source={{uri: image.single_image}}
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
          <Text style={styles.stockText}>
            {product.stock
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
            {product.short_description ||
              product.description ||
              'No description available'}
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
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: '#ccc',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 10,
                    }}></View>
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

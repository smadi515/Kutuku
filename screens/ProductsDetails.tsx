import React, {useEffect, useState} from 'react';
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

const ProductsDetails = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductsDetails'>>();
  const {product_id} = route.params;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    console.log('Fetching product details for ID:', product_id);
    fetch(`http://192.168.100.13:3250/api/products/${product_id}`)
      .then(res => res.json())
      .then(data => {
        console.log('Product data:', data);
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product details:', err);
        setLoading(false);
      });
  }, [product_id]);

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    const storedCart = await AsyncStorage.getItem('cart');
    let cart = storedCart ? JSON.parse(storedCart) : [];

    const existingItemIndex = cart.findIndex(
      (cartItem: any) => cartItem.id === product.product_id.toString(),
    );

    const productTitle = product?.description?.name || 'Unnamed Product';
    const productImage =
      product?.images?.[0]?.single_image || 'https://via.placeholder.com/150';

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity;
    } else {
      cart.push({
        id: product.product_id.toString(),
        title: productTitle,
        price: product.price,
        quantity,
        selected: true,
        image: {uri: productImage},
      });
    }

    await AsyncStorage.setItem('cart', JSON.stringify(cart));
    navigation.navigate('CartScreen');
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" color="purple" style={{marginTop: 40}} />
    );
  }

  if (!product) {
    return <Text style={{padding: 20}}>Product not found</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Header
        title="Product Details"
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

        <Text style={styles.priceText}>${product.price?.toFixed(2)}</Text>
        <Text style={styles.stockText}>
          {product.stock ? 'In Stock' : 'Out of Stock'}
        </Text>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionText}>
          {product.description?.description || 'No description available.'}
        </Text>

        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
          <Text style={styles.cartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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

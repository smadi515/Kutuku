import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App';
import Icon from '../components/icon';
import {ImageSourcePropType} from 'react-native';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ColorOption = {
  color: string;
  image: ImageSourcePropType;
};

const ProductsDetails = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProductsDetails'>>();

  const {
    title,
    price,
    colors = [
      {color: '#B76E79', image: require('../assets/jacket.png')},
      {color: '#000', image: require('../assets/jeans.png')},
      {color: '#00C2CB', image: require('../assets/jacket.png')},
      {color: '#00FF7F', image: require('../assets/jacket.png')},
    ],
    rating,
    reviewCount,
    stock,
    description,
  } = route.params;

  const [selectedColor, setSelectedColor] = useState<ColorOption>(
    (colors?.length > 0
      ? colors
      : [{color: '#fff', image: require('../assets/jeans.png')}])[0],
  );
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const handleAddToCart = async () => {
    // Construct the product object
    const product = {
      title, // The title of the product
      price, // The price of the product
      selectedColor, // The selected color
      quantity, // The quantity selected
      image: selectedColor.image, // Ensure the image is passed from selectedColor
    };

    console.log('Product added to cart:', product); // Debugging: Log the product to see its structure

    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];

      // Check if the product already exists in the cart
      const index = cart.findIndex(
        (item: any) =>
          item.title === product.title &&
          item.selectedColor.color === product.selectedColor.color,
      );

      if (index >= 0) {
        // If product already exists, update the quantity
        cart[index].quantity += quantity;
      } else {
        // Otherwise, add the product to the cart
        cart.push(product);
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      navigation.navigate('CartScreen'); // Navigate to Cart screen
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
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
      {/* Product Image */}
      <Image
        source={selectedColor.image}
        style={styles.productImage}
        resizeMode="cover"
      />

      <View style={styles.detailsContainer}>
        {/* Title and Quantity */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
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

        {/* Rating and Stock */}
        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>
            ⭐ {rating} ({reviewCount} Reviews)
          </Text>
          <Text style={styles.stockText}>{stock}</Text>
        </View>

        {/* Color Selection */}
        <Text style={styles.sectionTitle}>Color</Text>
        <View style={styles.colorRow}>
          {(colors && colors.length > 0 ? colors : []).map(colorItem => (
            <TouchableOpacity
              key={colorItem.color} // Use colorItem.color as the key
              style={[
                styles.colorCircle,
                {
                  backgroundColor: colorItem.color,
                  borderWidth: selectedColor.color === colorItem.color ? 2 : 0,
                  borderColor: '#333',
                },
              ]}
              onPress={() => setSelectedColor(colorItem)}
            />
          ))}
        </View>

        {/* Description */}
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{description}</Text>

        {/* Price and Add to Cart */}
        <View style={styles.footerRow}>
          <Text style={styles.priceText}>
            ${(typeof price === 'number' ? price : 0).toFixed(2)}
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Icon name="shoppingcart" type="ant" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  productImage: {width: '100%', height: 300},
  detailsContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -30,
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {fontSize: 20, fontWeight: 'bold', color: '#333', flex: 1},
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityText: {marginHorizontal: 10, fontSize: 16},
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  ratingText: {color: '#888', fontSize: 14},
  stockText: {color: 'green', fontSize: 14},
  sectionTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  colorRow: {flexDirection: 'row', marginVertical: 10},
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 12,
  },
  descriptionText: {color: '#666', fontSize: 14, marginTop: 8},
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  priceText: {fontSize: 24, fontWeight: 'bold', color: '#333'},
  addButton: {
    backgroundColor: '#6C63FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  addButtonText: {color: '#fff', marginLeft: 8, fontWeight: 'bold'},
});

export default ProductsDetails;

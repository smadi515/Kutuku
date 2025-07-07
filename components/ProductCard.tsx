import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Platform,
  Alert,
} from 'react-native';
import Icon from './icon';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../App';

type ProductDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProductsDetails'
>;

type ColorOption = {
  color: string;
  image: string;
};

type ProductCardProps = {
  product_id: number;
  currencySymbol?: string;

  urlKey: string;
  title: string;
  designer: string;
  price: number;
  image: string;
  description: string;
  stock_availability: boolean;
  isFavorite: boolean;
  onPressFavorite: () => void;
  onPressCart: () => void;
  colors?: ColorOption[];
};

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  designer,
  price,
  image,
  description,
  stock_availability,
  isFavorite,
  onPressFavorite,
  onPressCart,
  urlKey,
  currencySymbol,
}) => {
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();
  console.log('ProductCard rendered with urlKey:', urlKey);

  const showOutOfStockMessage = () => {
    const message = 'This product is out of stock.';
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Out of Stock', message);
    }
  };

  const handleCartPress = () => {
    if (!stock_availability) {
      console.log('stock_availability', stock_availability);

      showOutOfStockMessage();
      return;
    }
    onPressCart();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ProductsDetails', {url_key: urlKey})}
      style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image
          source={{uri: image || 'https://via.placeholder.com/150'}}
          style={styles.productImage}
          resizeMode="cover"
        />

        <TouchableOpacity style={styles.heartIcon} onPress={onPressFavorite}>
          <Icon
            name={isFavorite ? 'heart' : 'hearto'}
            type="ant"
            size={16}
            color={isFavorite ? 'red' : '#777'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartIcon} onPress={handleCartPress}>
          <Icon name="shoppingcart" type="ant" size={16} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.designer} numberOfLines={1}>
          {designer}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description || 'No description available'}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginTop: 4,
          }}>
          <Text style={styles.productPrice}>
            {currencySymbol} {price}
          </Text>
          {!stock_availability && (
            <>
              <Text>|</Text>
              <Text style={{color: 'red'}}>Out of stock</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  description: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageWrapper: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 20,
    elevation: 2,
  },
  cartIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 20,
    elevation: 2,
  },
  infoContainer: {
    padding: 10,
  },
  title: {
    fontWeight: '600',
    fontSize: 14,
    color: '#333',
  },
  designer: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 6,
  },
});

export default ProductCard;

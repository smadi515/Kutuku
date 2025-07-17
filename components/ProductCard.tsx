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
  onPressCart: () => void;
  colors?: ColorOption[];
  cardWidth?: number;
  cartIconSize?: number;
};

const CARD_HEIGHT = 260;

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  designer,
  price,
  image,
  description,
  stock_availability,
  onPressCart,
  urlKey,
  currencySymbol,
  cardWidth,
  cartIconSize = 24,
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
      activeOpacity={0.88}
      onPress={() => navigation.navigate('ProductsDetails', {url_key: urlKey})}
      style={[styles.card, cardWidth ? {width: cardWidth} : {}]}>
      <View style={styles.imageWrapper}>
        <Image
          source={{uri: image || 'https://via.placeholder.com/150'}}
          style={styles.productImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.cartIcon} onPress={handleCartPress} activeOpacity={0.85}>
          <Icon name="shoppingcart" type="ant" size={cartIconSize} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.designer} numberOfLines={1}>{designer}</Text>
        <Text style={styles.description} numberOfLines={2}>{description || 'No description available'}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{currencySymbol} {price}</Text>
          {!stock_availability && (
            <Text style={styles.outOfStockBadge}>Out of stock</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 148,
    minWidth: 130,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 12,
    marginHorizontal: 4,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#7B2FF2',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.13,
    shadowRadius: 14,
  },
  imageWrapper: {
    position: 'relative',
    backgroundColor: '#f7f7fb',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    height: 140,
  },
  productImage: {
    width: '100%',
    height: 140,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  cartIcon: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#F357A8',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#F357A8',
    shadowOpacity: 0.13,
    shadowRadius: 6,
    zIndex: 2,
  },
  infoContainer: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    color: '#222',
    marginBottom: 2,
  },
  designer: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7B2FF2',
  },
  outOfStockBadge: {
    backgroundColor: '#F357A8',
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    overflow: 'hidden',
  },
});

export default React.memo(ProductCard);

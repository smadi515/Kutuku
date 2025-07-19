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
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../App';
import colors from '../utils/colors';
import LinearGradient from 'react-native-linear-gradient';

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

const CARD_HEIGHT = 280;

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
  cartIconSize = 20,
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
      activeOpacity={0.9}
      onPress={() => navigation.navigate('ProductsDetails', { url_key: urlKey })}
      style={[styles.card, cardWidth ? { width: cardWidth } : {}]}>

      {/* Image Container with Gradient Overlay */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: image || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
          resizeMode="cover"
        />

        {/* Gradient Overlay for better text visibility */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.1)']}
          style={styles.imageGradient}
        />

        {/* Cart Icon with Enhanced Design */}
        <TouchableOpacity
          style={[
            styles.cartIcon,
            !stock_availability && styles.cartIconDisabled
          ]}
          onPress={handleCartPress}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={stock_availability ? ['#FF6B6B', '#FF8E8E'] : ['#999', '#BBB']}
            style={styles.cartIconGradient}
          >
            <Icon
              name="shoppingcart"
              type="ant"
              size={cartIconSize}
              color="#FFF"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Stock Status Badge */}
        {!stock_availability && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>OUT OF STOCK</Text>
          </View>
        )}

        {/* Price Tag Overlay */}
        <View style={styles.priceTag}>
          <Text style={styles.priceTagText}>
            {currencySymbol} {price}
          </Text>
        </View>
      </View>

      {/* Product Info Container */}
      <View style={styles.infoContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.designer} numberOfLines={1}>
            {designer}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {description || 'No description available'}
          </Text>
        </View>

        {/* Old Price Display */}
        {price > 100 && (
          <Text style={styles.originalPrice}>
            {currencySymbol} {Math.round(price * 1.2)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    minWidth: 140,
    height: CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 0,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  imageWrapper: {
    position: 'relative',
    backgroundColor: '#F8F8F8',
    height: 160,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 160,
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  cartIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 2,
  },
  cartIconDisabled: {
    opacity: 0.6,
  },
  cartIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
  },
  priceTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  designer: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    fontWeight: '500',
  },
  description: {
    fontSize: 11,
    color: '#999',
    lineHeight: 14,
  },

  originalPrice: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'line-through',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default React.memo(ProductCard);

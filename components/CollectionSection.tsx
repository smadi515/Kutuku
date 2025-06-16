import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../App';
import Icon from './icon';
import {useTranslation} from 'react-i18next';

type ProductDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProductsDetails'
>;

type ProductDescription = {
  name: string;
  short_description: string;
};

type ProductImage = {
  origin_image: string;
};

type Product = {
  price: number;
  description: ProductDescription;
  images: ProductImage[];
  inventory: {
    stock_availability: boolean;
  };
};

type ProductItem = {
  product_id: number;
  product: Product;
};

type Collection = {
  collection_id: number;
  name: string;
  code: string;
  image: string;
  products: ProductItem[];
};
type CollectionSectionProps = {
  isFavorite: (productId: number) => boolean;
  onPressFavorite: (productId: number) => void;
  onPressCart: (item: ProductItem) => void;
};
const CollectionSection: React.FC<CollectionSectionProps> = ({
  onPressFavorite,
  onPressCart,
  isFavorite,
}) => {
  const showOutOfStockMessage = () => {
    const message = 'This product is out of stock.';
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Out of Stock', message);
    }
  };

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();
  const {i18n} = useTranslation();

  const fetchCollections = async () => {
    try {
      const lang = i18n.language || 'en'; // fallback if language is missing
      const response = await fetch(
        `https://api.sareh-nomow.xyz/api/collections?lang=${lang}`,
      );
      const data = await response.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCollections();
  });
  const renderProduct = ({item}: {item: ProductItem}) => {
    const {product_id, product} = item;
    const {description, price, images, inventory} = product;
    const stockAvailability = inventory.stock_availability;

    const handleCartPress = () => {
      if (!stockAvailability) {
        showOutOfStockMessage();
        return;
      }
      onPressCart(item);
    };

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('ProductsDetails', {product_id});
        }}
        style={styles.productCard}>
        <View style={styles.imageWrapper}>
          <Image
            source={{uri: images[0]?.origin_image}}
            style={styles.productImage}
          />
          <TouchableOpacity
            style={styles.heartIcon}
            onPress={() => onPressFavorite(product_id)}>
            <Icon
              name={isFavorite(product_id) ? 'heart' : 'hearto'}
              type="ant"
              size={16}
              color={isFavorite(product_id) ? 'red' : '#777'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartIcon} onPress={handleCartPress}>
            <Icon name="shoppingcart" type="ant" size={16} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.productName}>{description.name}</Text>
        <Text style={styles.productPrice}>${price}</Text>
        <Text style={styles.productShort}>
          {description.short_description || 'No description available'}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginTop: 4,
          }}>
          <Text style={styles.productPrice}>${price.toFixed(2)}</Text>
          {!inventory.stock_availability && (
            <>
              <Text>|</Text>
              <Text style={{color: 'red'}}>Out of stock</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{marginTop: 20}} />;
  }

  return (
    <View>
      {collections.map(collection => (
        <View key={collection.collection_id} style={styles.collectionContainer}>
          <Text style={styles.collectionTitle}>{collection.name}</Text>
          <FlatList
            data={collection.products}
            keyExtractor={item => item.product_id.toString()}
            renderItem={renderProduct}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  collectionContainer: {
    marginVertical: 16,
    paddingHorizontal: 12,
  },
  imageWrapper: {
    position: 'relative',
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
  collectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productCard: {
    marginRight: 12,
    width: 160,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  productName: {
    marginTop: 6,
    fontWeight: 'bold',
  },
  productPrice: {
    color: 'black',
  },
  productShort: {
    fontSize: 12,
    color: 'gray',
  },
});

export default CollectionSection;

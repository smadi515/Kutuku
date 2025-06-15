import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../App';

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

const CollectionSection = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      const response = await fetch(
        'https://api.sareh-nomow.xyz/api/collections',
      );
      const data = await response.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({item}: {item: ProductItem}) => {
    const {product_id, product} = item;
    const {description, price, images} = product;

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('ProductsDetails', {product_id});
        }}
        style={styles.productCard}>
        <Image
          source={{uri: images[0]?.origin_image}}
          style={styles.productImage}
        />
        <Text style={styles.productName}>{description.name}</Text>
        <Text style={styles.productPrice}>${price}</Text>
        <Text style={styles.productShort}>{description.short_description}</Text>
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
    color: 'green',
  },
  productShort: {
    fontSize: 12,
    color: 'gray',
  },
});

export default CollectionSection;

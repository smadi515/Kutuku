import React, {useCallback, useEffect, useState} from 'react';
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
  type: string;
  products: ProductItem[];
};

const CollectionSection = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();
  const {i18n} = useTranslation();

  const fetchCollections = useCallback(async () => {
    try {
      const lang = i18n.language || 'en';
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
  }, [i18n.language]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);
  // ← Add empty dependency array

  const renderProduct = ({item}: {item: ProductItem}) => {
    const {product_id, product} = item;
    const {description, price, images, inventory} = product;
    const stockAvailability = inventory.stock_availability;

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
        </View>
        <Text style={styles.productName}>{description.name}</Text>
        <Text style={styles.productPrice}>${price}</Text>
        <Text style={styles.productShort}>
          {description.short_description || 'No description available'}
        </Text>
        <View style={styles.stockRow}>
          <Text style={styles.productPrice}>${price.toFixed(2)}</Text>
          {!stockAvailability && (
            <>
              <Text> | </Text>
              <Text style={{color: 'red'}}>Out of stock</Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const bannerCollections = collections.filter(c => c.type === 'banner');

  const renderBanner = () => {
    return (
      <FlatList
        data={bannerCollections}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.collection_id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('StoreScreen', {
                collectionId: item.collection_id,
              })
            }
            style={styles.bannerContainer}>
            <Image
              source={{uri: item.image}}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={{paddingHorizontal: 12, marginTop: 16}}
      />
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{marginTop: 20}} />;
  }

  return (
    <View>
      {renderBanner()}
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
  imageWrapper: {
    position: 'relative',
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
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  bannerContainer: {
    height: 180,
    width: 320,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});

export default CollectionSection;

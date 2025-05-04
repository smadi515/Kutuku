import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from './icon';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../App';
import {ImageSourcePropType} from 'react-native';

type ProductDetailsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProductsDetails'
>;

type ColorOption = {
  color: string;
  image: ImageSourcePropType;
};

type ProductCardProps = {
  title: string;
  designer: string;
  price: number;
  image: ImageSourcePropType;
  isFavorite: boolean;
  onPressFavorite: () => void;
  onPressCart: () => void;
  colors?: ColorOption[];
};

const ProductCard = ({
  title,
  designer,
  price,
  image,
  isFavorite,
  onPressFavorite,
  onPressCart,
  colors,
}: ProductCardProps) => {
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();

  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate('ProductsDetails', {
          title,
          designer,
          price: 195,
          image,
          isFavorite,
          colors: colors || [],
          rating: 4.8,
          reviewCount: 320,
          stock: 'Available in stock',
          description:
            'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
        });
      }}
      style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image source={image} style={styles.productImage} resizeMode="cover" />
        <TouchableOpacity style={styles.heartIcon} onPress={onPressFavorite}>
          <Icon
            name="hearto"
            type="ant"
            size={16}
            color={isFavorite ? 'red' : '#777'}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartIcon} onPress={onPressCart}>
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
        <Text style={styles.productPrice}>{price}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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

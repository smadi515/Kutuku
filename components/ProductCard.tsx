// components/ProductCard.tsx
import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from './icon';

const ProductCard = ({title, designer, price, image}: any) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image source={image} style={styles.productImage} resizeMode="cover" />
        <TouchableOpacity style={styles.heartIcon}>
          <Icon name="hearto" type="ant" size={16} color="#777" />
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 1,
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

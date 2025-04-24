import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, FlatList} from 'react-native';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import type {RootStackParamList} from '../App';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const products = [
  {
    id: '1',
    image: require('../assets/Maskgroup4.png'),
    title: 'The Mirac Jiz',
    designer: 'Lisa Robber',
    price: 195.0,
  },
  {
    id: '2',
    image: require('../assets/Maskgroup4.png'),
    title: 'Meriza Kiles',
    designer: 'Lisa Robber',
    price: 143.45,
  },
  {
    id: '3',
    image: require('../assets/Maskgroup4.png'),
    title: 'Meriza Kiles',
    designer: 'Lisa Robber',
    price: 143.45,
  },
  {
    id: '4',
    image: require('../assets/Maskgroup4.png'),
    title: 'Meriza Kiles',
    designer: 'Lisa Robber',
    price: 143.45,
  },
  {
    id: '5',
    image: require('../assets/Maskgroup4.png'),
    title: 'Meriza Kiles',
    designer: 'Lisa Robber',
    price: 143.45,
  },
  {
    id: '6',
    image: require('../assets/Maskgroup4.png'),
    title: 'Meriza Kiles',
    designer: 'Lisa Robber',
    price: 143.45,
  },
  // Add more products if needed
];

const StoreScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleAddToCart = async (product: any) => {
    try {
      const existingCart = await AsyncStorage.getItem('cart');
      let cart = existingCart ? JSON.parse(existingCart) : [];
      const index = cart.findIndex((item: any) => item.id === product.id);

      if (index >= 0) {
        cart[index].quantity += 1;
      } else {
        cart.push({...product, quantity: 1});
      }

      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      navigation.navigate('CartScreen');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const toggleFavorite = async (productId: string) => {
    try {
      let updatedFavorites: string[];
      if (favorites.includes(productId)) {
        updatedFavorites = favorites.filter(id => id !== productId);
      } else {
        updatedFavorites = [...favorites, productId];
      }
      setFavorites(updatedFavorites);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  // Load favorites on screen load
  useEffect(() => {
    const loadFavorites = async () => {
      const stored = await AsyncStorage.getItem('favorites');
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    };
    loadFavorites();
  }, []);

  return (
    <View style={styles.container}>
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

      <ScrollView contentContainerStyle={{padding: 16, paddingTop: 10}}>
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={item => item.id}
          columnWrapperStyle={{justifyContent: 'space-between'}}
          renderItem={({item}) => (
            <ProductCard
              {...item}
              isFavorite={favorites.includes(item.id)}
              onPressFavorite={() => toggleFavorite(item.id)}
              onPressCart={() => handleAddToCart(item)}
            />
          )}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  // ... your styles
});

export default StoreScreen;

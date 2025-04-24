import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../App';
import Icon from '../components/icon';
import BottomSheet from '@gorhom/bottom-sheet';
const allProducts = [
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
  // Add the rest if needed
];

const Favorites = () => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const openFilterSheet = () => {
    console.log('BottomSheet ref:', bottomSheetRef.current);

    bottomSheetRef.current?.snapToIndex(0);
  };
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [favoriteProducts, setFavoriteProducts] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  useEffect(() => {
    const loadFavorites = async () => {
      const stored = await AsyncStorage.getItem('favorites');
      const ids = stored ? JSON.parse(stored) : [];

      const favItems = allProducts.filter(p => ids.includes(p.id));
      setFavoriteProducts(favItems);
    };

    loadFavorites();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title=" my Favorites"
        showBack={true}
        showImage={false}
        rightIcons={[
          {
            name: 'notifications',
            type: 'Ionicons',
            onPress: () => navigation.navigate('NotificationScreen'),
          },
        ]}
      />
      <View style={{paddingHorizontal: 10}}>
        <View style={styles.searchBar}>
          <Icon type="ant" name="search1" size={20} style={{marginRight: 8}} />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            placeholderTextColor="#aaa"
            value={searchText}
            onChangeText={text => setSearchText(text)}
          />
          <TouchableOpacity onPress={openFilterSheet}>
            <Icon type="ant" name="filter" size={20} />
          </TouchableOpacity>
        </View>
      </View>
      {favoriteProducts.length === 0 ? (
        <ScrollView contentContainerStyle={{paddingTop: 10}}>
          <Text style={styles.emptyText}>No favorites yet.</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={favoriteProducts}
          numColumns={2}
          keyExtractor={item => item.id}
          columnWrapperStyle={{justifyContent: 'space-between'}}
          contentContainerStyle={{padding: 16, paddingTop: 15}}
          renderItem={({item}) => (
            <ProductCard
              {...item}
              isFavorite={true}
              onPressFavorite={() => {}}
              onPressCart={() => {}}
              scrollEnabled={true}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
    width: '100%',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
});

export default Favorites;

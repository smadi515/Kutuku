import React, {useState, useRef, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Icon from '../components/icon';
import {useTranslation} from 'react-i18next';
import {searchProducts} from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';

const SearchScreen = ({navigation}: any) => {
  const {t, i18n} = useTranslation();
  type ProductDescription = {
    name: string;
    short_description: string;
    url_key: string;
    description: string;
  };
  type Product = {
    product_id: number;
    price: number;
    name: string;
    image: string;
    description: ProductDescription;
  };

  const [filteredResults, setFilteredResults] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [450], []);

  const openFilterSheet = () => bottomSheetRef.current?.snapToIndex(0);
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchText.length < 3) {
        setFilteredResults([]);
        return;
      }

      try {
        setLoading(true);
        console.log('Searching for:', searchText);

        const results = await searchProducts(i18n.language, searchText);
        console.log('Raw API response:', results);
        const transformed = results.map((product: any) => {
          return {
            product_id: product.product_id,
            price: product.price,
            name: product.description?.name ?? 'No name',
            image:
              product.images?.find((img: any) => img.is_main)?.origin_image ??
              product.images?.[0]?.origin_image ??
              'https://via.placeholder.com/100',
            description: {
              url_key: product.description?.url_key ?? '',
            },
          };
        });

        setFilteredResults(transformed);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchSearchResults, 500); // debounce

    return () => clearTimeout(delayDebounce);
  }, [searchText, i18n.language, t]); // ✅ include `t` here

  useEffect(() => {
    // Load search history from AsyncStorage on mount
    const loadHistory = async () => {
      const stored = await AsyncStorage.getItem('searchHistory');
      if (stored) setSearchHistory(JSON.parse(stored));
    };
    loadHistory();
  }, []);

  // Save search history to AsyncStorage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  const handleTagPress = (term: string) => {
    setSearchText(term);
  };
  const handleSearchSelect = (product: any) => {
    const urlKey = product?.description?.url_key || '';
    console.log('Navigating with url_key:', urlKey);

    if (!urlKey) {
      console.warn('Missing url_key for selected product:', product);
      return; // Prevent navigating with an invalid key
    }

    if (!searchHistory.includes(product.name)) {
      setSearchHistory(prev => [product.name, ...prev.slice(0, 9)]);
    }

    navigation.navigate('ProductsDetails', {url_key: urlKey});
  };

  const removeItem = (item: string) => {
    setSearchHistory(prev => prev.filter(i => i !== item));
  };

  const clearAll = () => setSearchHistory([]);

  // Fetch products for suggested grid (like HomeScreen)
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  useEffect(() => {
    const fetchProducts = async () => {
      setSuggestedLoading(true);
      try {
        const result = await require('../lib/api').getProducts(i18n.language);
        // Filter out products missing essential data
        const filtered = result.filter(
          (product: any) =>
            product.description &&
            product.description.name &&
            product.description.url_key &&
            product.images &&
            product.images.length > 0,
        );
        setSuggestedProducts(filtered.slice(0, 6));
      } catch (error) {
        setSuggestedProducts([]);
      } finally {
        setSuggestedLoading(false);
      }
    };
    fetchProducts();
  }, [i18n.language]);

  return (
    <View style={{flex: 1, backgroundColor: '#F5F0FF'}}>
      <LinearGradient colors={["#7B2FF2", "#F357A8"]} style={{height: 120, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 0}}/>
      {/* Search Bar */}
      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 36, marginBottom: 18, zIndex: 1, paddingHorizontal: 8}}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{marginRight: 14, backgroundColor: '#fff', borderRadius: 22, padding: 7, elevation: 3, shadowColor: '#7B2FF2', shadowOpacity: 0.13, shadowRadius: 6}}>
          <Icon
            type="ant"
            name="arrowleft"
            size={24}
            color="#7B2FF2"
            style={{fontWeight: 'bold'}}
          />
        </TouchableOpacity>
        <View style={[styles.searchBar, {flex: 1}]}>
          <Icon type="ant" name="search1" size={20} style={{marginRight: 8}} />
          <TextInput
            placeholder={t('search.placeholder_search')}
            style={styles.searchInput}
            placeholderTextColor="#aaa"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={openFilterSheet}>
            <Icon type="ant" name="filter" size={20} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Last Searches */}
      <View style={[styles.sectionHeader, {paddingHorizontal: 8, marginTop: 8}]}>
        <Text style={styles.sectionTitle}>{t('search.last_search')}</Text>
        {searchHistory.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearAll}>{t('search.clear_all')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.historyContainer, {paddingHorizontal: 8}]}>
        {searchHistory.map((item, index) => (
          <View key={index} style={styles.historyTag}>
            <TouchableOpacity onPress={() => handleTagPress(item)}>
              <Text style={styles.historyText}>{item}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeItem(item)}>
              <Icon
                type="ant"
                name="close"
                size={12}
                color="#555"
                style={{marginLeft: 5}}
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
      {/* Results or Suggested Products */}
      <Text style={[styles.sectionTitle, {marginTop: 24, marginBottom: 8, paddingHorizontal: 8}]}>
        {searchText ? t('search.results') : t('search.suggested_products')}
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#7B2FF2" />
      ) : searchText.length >= 3 ? (
        <FlatList
          key={'single'}
          data={filteredResults}
          keyExtractor={item => item.product_id.toString()}
          ListEmptyComponent={() => (
            <Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>
              {t('search.search_results')}
            </Text>
          )}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => handleSearchSelect(item)}
              style={styles.productCard}>
              <Image
                source={{uri: item.image}}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={{flex: 1}}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCount}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          key={'double'}
          data={suggestedProducts}
          keyExtractor={item => item.product_id.toString()}
          numColumns={2}
          columnWrapperStyle={{justifyContent: 'space-between', paddingHorizontal: 8}}
          contentContainerStyle={{paddingBottom: 24}}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => handleSearchSelect(item)}
              style={styles.suggestedCard}>
              <Image
                source={{uri: item.images?.find((img: any) => img.is_main)?.origin_image || item.images?.[0]?.origin_image || 'https://via.placeholder.com/100'}}
                style={styles.suggestedImage}
                resizeMode="cover"
              />
              <Text style={styles.suggestedName}>{item.description?.name || 'No name'}</Text>
              <Text style={styles.suggestedPrice}>${item.price}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      {/* Filter Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{padding: 20, flex: 1}}>
          <Text style={styles.sectionTitle}>{t('search.filter_Products')}</Text>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16, backgroundColor: '#fff'},
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#7B2FF2',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 20,
    width: '90%',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#7B2FF2',
  },
  clearAll: {
    fontSize: 14,
    color: '#F357A8',
    fontWeight: 'bold',
  },
  historyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  historyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F0FF',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  historyText: {
    fontSize: 14,
    color: '#7B2FF2',
    fontWeight: '600',
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.09,
    shadowRadius: 10,
  },
  suggestedCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    width: '48%',
    elevation: 4,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.09,
    shadowRadius: 10,
  },
  suggestedImage: {
    width: 100,
    height: 100,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  suggestedName: {
    fontWeight: '700',
    fontSize: 15,
    color: '#222',
    textAlign: 'center',
    marginBottom: 4,
  },
  suggestedPrice: {
    color: '#F357A8',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#eee',
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
  },
  itemCount: {
    color: '#F357A8',
    fontSize: 13,
    marginTop: 2,
    fontWeight: '700',
  },
});

export default SearchScreen;

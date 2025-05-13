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
import {getProducts} from '../lib/api'; // adjust path as needed

const SearchScreen = ({navigation}: any) => {
  type Product = {
    product_id: number;
    name: string;
    image: string;

    price: number;
  };

  const [filteredResults, setFilteredResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [450], []);

  const openFilterSheet = () => bottomSheetRef.current?.snapToIndex(0);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await getProducts();
        console.log('Products fetched:', result);

        const transformed = result.map((product: any) => {
          return {
            ...product,
            name: product.name || product.sku || 'No name',
            description: product.description || '',
            short_description: product.short_description || '',
            image:
              product.images?.[0]?.listing_image ||
              'https://via.placeholder.com/100',
          };
        });

        setAllProducts(transformed);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);
  useEffect(() => {
    const results = allProducts.filter(product => {
      if (searchText.length >= 3) {
        return product.name?.toLowerCase().includes(searchText.toLowerCase());
      } else {
        return allProducts;
      }
    });
    setFilteredResults(results);
  }, [searchText, allProducts]);
  const handleTagPress = (term: string) => {
    setSearchText(term);
  };

  const handleSearchSelect = (product: any) => {
    if (!searchHistory.includes(product.name)) {
      setSearchHistory(prev => [product.name, ...prev.slice(0, 9)]); // keep last 10
    }
    navigation.navigate('ProductsDetails', {product_id: product.product_id});
  };

  const removeItem = (item: string) => {
    setSearchHistory(prev => prev.filter(i => i !== item));
  };

  const clearAll = () => setSearchHistory([]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Icon
          type="ant"
          name="arrowleft"
          size={20}
          onPress={() => navigation.goBack()}
        />
        <View style={styles.searchBar}>
          <Icon type="ant" name="search1" size={20} style={{marginRight: 8}} />
          <TextInput
            placeholder="Search"
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
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Last Search</Text>
        {searchHistory.length > 0 && (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearAll}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.historyContainer}>
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

      {/* Results */}
      <Text style={[styles.sectionTitle, {marginTop: 20}]}>
        {searchText ? 'Search Results' : 'Suggested Products'}
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6A5ACD" />
      ) : (
        <FlatList
          data={searchText ? filteredResults : allProducts.slice(0, 10)}
          keyExtractor={item => item.product_id.toString()}
          ListEmptyComponent={() => (
            <Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>
              No results found 😢
            </Text>
          )}
          renderItem={({item}) => {
            console.log('Image URL:', item.image); // ✅ Valid inside a block

            return (
              <TouchableOpacity
                onPress={() => handleSearchSelect(item)}
                style={styles.popularItem}>
                <Image
                  source={{uri: item.image}}
                  style={styles.popularImage}
                  resizeMode="cover"
                />
                <View style={{flex: 1}}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCount}>${item.price}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Filter Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{padding: 20, flex: 1}}>
          <Text style={styles.sectionTitle}>Filter Products</Text>
          {/* ... filter content here ... */}
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
    width: '90%',
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
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#000',
  },
  clearAll: {
    fontSize: 14,
    color: '#6A5ACD',
  },
  historyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  historyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  historyText: {
    fontSize: 14,
    color: '#333',
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  popularImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
  },
  itemCount: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
});

export default SearchScreen;

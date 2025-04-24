import React, {useState, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import Icon from '../components/icon';

const SearchScreen = ({navigation}: any) => {
  const [searchText, setSearchText] = useState('');
  const [searchHistory, setSearchHistory] = useState([
    'Electronics',
    'Pants',
    'Three Second',
    'Long shirt',
  ]);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [450], []);

  const openFilterSheet = () => {
    console.log('BottomSheet ref:', bottomSheetRef.current);

    bottomSheetRef.current?.snapToIndex(0);
  };

  const popularSearches = [
    {
      id: '1',
      name: 'Lunilo Hils jacket',
      tag: 'Hot',
      tagColor: '#FF6B6B',
      image: require('../assets/jacket.png'),
      count: '1.6k Search today',
    },
    {
      id: '2',
      name: 'Denim Jeans',
      tag: 'New',
      tagColor: '#FFD6A5',
      image: require('../assets/jeans.png'),
      count: '1k Search today',
    },
    {
      id: '3',
      name: 'Redil Backpack',
      tag: 'Popular',
      tagColor: '#B9FBC0',
      image: require('../assets/bag.png'),
      count: '1.23k Search today',
    },
    {
      id: '4',
      name: 'JBL Speakers',
      tag: 'New',
      tagColor: '#FFD6A5',
      image: require('../assets/speaker.png'),
      count: '1.1k Search today',
    },
  ];

  const filteredResults = popularSearches.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const removeItem = (item: string) => {
    setSearchHistory(prev => prev.filter(i => i !== item));
  };

  const clearAll = () => {
    setSearchHistory([]);
  };

  const handleTagPress = (tag: string) => {
    setSearchText(tag);
  };

  return (
    <View style={styles.container}>
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
            onChangeText={text => setSearchText(text)}
          />
          <TouchableOpacity onPress={openFilterSheet}>
            <Icon type="ant" name="filter" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Last Search */}
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

      <Text style={[styles.sectionTitle, {marginTop: 20}]}>
        {searchText ? 'Search Results' : 'Popular Search'}
      </Text>

      <FlatList
        data={filteredResults}
        keyExtractor={item => item.id}
        ListEmptyComponent={() => (
          <Text style={{textAlign: 'center', marginTop: 20, color: '#888'}}>
            No results found 😢
          </Text>
        )}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => {
              if (!searchHistory.includes(item.name)) {
                setSearchHistory(prev => [item.name, ...prev]);
              }
            }}
            style={styles.popularItem}>
            <Image source={item.image} style={styles.popularImage} />
            <View style={{flex: 1}}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemCount}>{item.count}</Text>
            </View>
            <View style={[styles.tag, {backgroundColor: item.tagColor}]}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Bottom Sheet for Filters */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{padding: 20, flex: 1}}>
          <Text style={styles.sectionTitle}>Filter Products</Text>

          {/* Price Filter */}
          <Text style={{marginTop: 20}}>Price Range</Text>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Min"
              keyboardType="numeric"
              style={styles.input}
            />
            <Text style={{marginHorizontal: 10}}>-</Text>
            <TextInput
              placeholder="Max"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          {/* Color Filter */}
          <Text style={{marginTop: 20}}>Color</Text>
          <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
            {['Red', 'Blue', 'Black', 'Green'].map(color => (
              <View key={color} style={styles.colorBox}>
                <Text>{color}</Text>
              </View>
            ))}
          </View>

          {/* Location Filter */}
          <Text style={{marginTop: 20}}>Location</Text>
          <TextInput
            placeholder="Enter location"
            style={styles.locationInput}
          />

          {/* Apply Button */}
          <TouchableOpacity style={styles.applyBtn}>
            <Text style={{color: '#fff', fontWeight: 'bold'}}>
              Apply Filter
            </Text>
          </TouchableOpacity>
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
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  itemCount: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  colorBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 10,
  },
  locationInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  applyBtn: {
    backgroundColor: '#6A5ACD',
    padding: 14,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 30,
  },
});

export default SearchScreen;

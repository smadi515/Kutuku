// screens/CategoryTab.tsx
import React, {useEffect, useState} from 'react';
import {
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput, // Add TextInput for search
} from 'react-native';
import {getParentCategories} from '../lib/api';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../App';
import {useTranslation} from 'react-i18next';

type Category = {
  id: number;
  name: string;
  image: string;
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'StoreScreen'
>;

const CategoryTab = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]); // For filtered categories
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState<string>(''); // State to store search text
  const navigation = useNavigation<NavigationProp>();

  const handleCategoryPress = (id: number) => {
    navigation.navigate('StoreScreen', {categoryId: id});
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    const filtered = categories.filter(
      category => category.name.toLowerCase().includes(text.toLowerCase()), // Filter categories by name
    );
    setFilteredCategories(filtered);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getParentCategories();
        console.log('Fetched categories:', data); // 👈 Add this to debug
        setCategories(data);
        setFilteredCategories(data); // Initially set filtered categories to all categories
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator size="large" color="purple" style={{marginTop: 20}} />
    );
  }

  return (
    <ScrollView style={[styles.container, {direction: isRTL ? 'rtl' : 'ltr'}]}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder={t('CategoryTab.search_categories')}
        value={searchText}
        onChangeText={handleSearch}
      />

      {/* Categories List */}
      {filteredCategories.map(category => (
        <TouchableOpacity
          key={category.id}
          onPress={() => handleCategoryPress(category.id)}
          style={styles.card}>
          <Image
            source={{uri: category.image}}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.title}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#F5F0FF',
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  card: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    backgroundColor: '#eaeaea',
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CategoryTab;

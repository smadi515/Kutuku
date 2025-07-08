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
  View, // Added View for categories grid
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
        placeholderTextColor="#aaa"
      />
      {/* Categories List */}
      <View style={styles.categoriesGrid}>
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
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 14,
    backgroundColor: '#F7F7FB',
  },
  searchInput: {
    height: 44,
    borderColor: '#7B2FF2',
    borderWidth: 1.5,
    borderRadius: 14,
    marginBottom: 18,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#222',
    elevation: 2,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 18,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.09,
    shadowRadius: 10,
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#eee',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  title: {
    padding: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#7B2FF2',
    textAlign: 'center',
  },
});

export default CategoryTab;

// screens/BrandTab.tsx
import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../App';
import BrandCard from '../components/BrandCard';
import {getBrands} from '../lib/api';
import {useTranslation} from 'react-i18next';

type Brand = {
  id: number;
  name: string;
  image: string;
};

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'StoreScreen'
>;

const BrandTab = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState<string>(''); // State to store search text
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const fetch = async () => {
      const data = await getBrands();
      setBrands(data);
      setFilteredBrands(data); // Initially set filtered brands to all brands
      setLoading(false);
    };
    fetch();
  }, []);

  const handleBrandPress = (brandId: number) => {
    navigation.navigate('StoreScreen', {brandId});
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    const filtered = brands.filter(
      brand => brand.name.toLowerCase().includes(text.toLowerCase()), // Filter brands by name
    );
    setFilteredBrands(filtered);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="purple" />
      </View>
    );
  }

  return (
    <View style={[styles.container, {direction: isRTL ? 'rtl' : 'ltr'}]}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder={t('brandsTab.search_Brands')}
        value={searchText}
        onChangeText={handleSearch}
      />

      {/* Brands List */}
      <ScrollView contentContainerStyle={styles.brandsContainer}>
        {filteredBrands.map(brand => (
          <BrandCard
            key={brand.id}
            id={brand.id}
            name={brand.name}
            image={brand.image}
            onPress={handleBrandPress}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f7f7f7',
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
  brandsContainer: {
    paddingBottom: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BrandTab;

// screens/BrandTab.tsx
import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Image,
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
    const filtered = brands.filter(brand =>
      brand.name.toLowerCase().includes(text.toLowerCase()),
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
    <ScrollView style={[styles.container, {direction: isRTL ? 'rtl' : 'ltr'}]}>
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder={t('brandsTab.search_Brands')}
        value={searchText}
        onChangeText={handleSearch}
        placeholderTextColor="#aaa"
      />
      {/* Brands List */}
      <View style={styles.brandsGrid}>
        {filteredBrands.map(brand => {
          if (!brand.image) return null;
          return (
            <TouchableOpacity
              key={brand.id}
              onPress={() => handleBrandPress(brand.id)}
              style={styles.card}
              activeOpacity={0.85}
            >
              <Image source={{uri: brand.image}} style={styles.image} resizeMode="cover" />
              <Text style={styles.name}>{brand.name}</Text>
            </TouchableOpacity>
          );
        })}
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
  brandsGrid: {
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
  name: {
    padding: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#7B2FF2',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BrandTab;

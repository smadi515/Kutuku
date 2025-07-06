import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from '../components/icon';
import Header from '../components/Header';
import {useTranslation} from 'react-i18next';

type Language = 'en' | 'ar' | string; // you can widen this if you add more languages dynamically

type LanguageItem = {
  id: number;
  languageCode: string;
  languageName: string;
  isActive: boolean;
  flagUrl?: string | null;
};

const LanguageScreen = () => {
  const {t, i18n} = useTranslation();

  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    i18n.language,
  );
  const [loading, setLoading] = useState(true);

  const fetchLanguages = React.useCallback(async () => {
    try {
      const response = await fetch('https://api.sareh-nomow.xyz/api/languages');
      const json = await response.json();
      if (json.data && Array.isArray(json.data)) {
        // Optionally filter active languages only
        const activeLanguages = json.data.filter(
          (lang: LanguageItem) => lang.isActive,
        );
        setLanguages(activeLanguages);
      } else {
        Alert.alert(t('language_screen.error_fetching_languages'));
      }
    } catch (error) {
      Alert.alert(t('language_screen.error_fetching_languages'));
      console.error('Failed to fetch languages:', error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);
  const handleSelect = (code: Language) => {
    setSelectedLanguage(code);
    i18n.changeLanguage(code);
  };

  const renderItem = ({item}: {item: LanguageItem}) => {
    const isSelected = item.languageCode === selectedLanguage;
    return (
      <TouchableOpacity
        onPress={() => handleSelect(item.languageCode)}
        style={[
          styles.languageItem,
          isSelected && styles.languageItemSelected,
        ]}>
        <View style={styles.languageInfo}>
          {item.flagUrl ? (
            <Image source={{uri: item.flagUrl}} style={styles.flag} />
          ) : (
            <Image
              source={
                item.languageCode === 'en'
                  ? require('../assets/usa.png')
                  : item.languageCode === 'ar'
                  ? require('../assets/ksa.png')
                  : require('../assets/white_flag.jpg')
              }
              style={styles.flag}
            />
          )}
          <Text style={styles.languageText}>{item.languageName}</Text>
        </View>
        {isSelected && (
          <Icon
            name="check"
            type="feather"
            size={20}
            color="purple"
            style={styles.checkIcon}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="purple" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        showBack={true}
        showImage={false}
        title={t('language_screen.title')}
        rightIcons={[
          {
            name: 'info',
            type: 'AntDesign',
            onPress: () => {},
          },
        ]}
      />
      <View style={{padding: 10}}>
        <FlatList
          data={languages}
          renderItem={renderItem}
          keyExtractor={item => item.languageCode}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={{textAlign: 'center', marginTop: 20}}>
              {t('language_screen.no_languages')}
            </Text>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    marginTop: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 14,
    borderRadius: 12,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  languageItemSelected: {
    borderColor: 'purple',
    backgroundColor: '#f5f0ff',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    width: 30,
    height: 20,
    marginRight: 12,
    resizeMode: 'contain',
  },
  languageText: {
    fontSize: 16,
    color: '#333',
  },
  checkIcon: {
    marginLeft: 10,
  },
});

export default LanguageScreen;

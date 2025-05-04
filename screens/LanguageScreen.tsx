import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import Icon from '../components/icon';
import Header from '../components/Header';

type Language = 'en' | 'ar';

const languages = [
  {
    code: 'en',
    name: 'English',
    flag: require('../assets/usa.png'), // <- Add usa.png to your assets
  },
  {
    code: 'ar',
    name: 'Arabic',
    flag: require('../assets/ksa.png'), // <- Add ksa.png to your assets
  },
];

const LanguageScreen = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');

  const handleSelect = (code: Language) => {
    setSelectedLanguage(code);
  };

  const renderItem = ({item}: {item: (typeof languages)[0]}) => {
    const isSelected = item.code === selectedLanguage;
    return (
      <TouchableOpacity
        onPress={() => handleSelect(item.code as Language)}
        style={[
          styles.languageItem,
          isSelected && styles.languageItemSelected,
        ]}>
        <View style={styles.languageInfo}>
          <Image source={item.flag} style={styles.flag} />
          <Text style={styles.languageText}>{item.name}</Text>
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

  return (
    <View style={styles.container}>
      <Header
        showBack={true}
        showImage={false}
        title="Language"
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
          keyExtractor={item => item.code}
          contentContainerStyle={styles.list}
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

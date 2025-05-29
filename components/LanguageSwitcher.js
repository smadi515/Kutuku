import React from 'react';
import {View, Button, I18nManager} from 'react-native';
import i18n from '../i18n'; // adjust path based on your project
import RNRestart from 'react-native-restart';

export default function LanguageSwitcher() {
  const changeLanguage = async lng => {
    await i18n.changeLanguage(lng);

    // Optional: Force RTL layout for Arabic
    if (lng === 'ar') {
      I18nManager.forceRTL(true);
    } else {
      I18nManager.forceRTL(false);
    }

    // Optional: Reload the app to apply layout direction changes
    RNRestart.Restart(); // You need to install react-native-restart
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        margin: 20,
      }}>
      <Button title="English" onPress={() => changeLanguage('en')} />
      <Button title="العربية" onPress={() => changeLanguage('ar')} />
    </View>
  );
}

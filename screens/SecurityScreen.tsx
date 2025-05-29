import React from 'react';
import {View, StyleSheet} from 'react-native';
import ToggleRowItem from '../components/ToggleRowItem';
import Header from '../components/Header';
import {useTranslation} from 'react-i18next';

const SecurityScreen = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  return (
    <View style={styles.container}>
      <Header
        showBack={true}
        showImage={false}
        title={t('Security.title')}
        rightIcons={[
          {
            name: 'info',
            type: 'AntDesign',
            onPress: () => {},
          },
        ]}
      />
      <View style={{direction: isRTL ? 'rtl' : 'ltr'}}>
        <View style={styles.card}>
          <ToggleRowItem title={t('Security.faceId')} initialValue />
          <ToggleRowItem title={t('Security.rememberPassword')} initialValue />
          <ToggleRowItem title={t('Security.touchId')} initialValue />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
  },
});

export default SecurityScreen;

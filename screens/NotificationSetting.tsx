import React from 'react';
import {View, StyleSheet} from 'react-native';
import ToggleRowItem from '../components/ToggleRowItem';
import Header from '../components/Header';
import {useTranslation} from 'react-i18next';

const NotificationSetting = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <View style={styles.container}>
      <Header
        showBack={true}
        showImage={false}
        title={t('NotificationSetting.title')}
        rightIcons={[
          {
            name: 'info',
            type: 'AntDesign',
            onPress: () => {},
          },
        ]}
      />
      <View style={[styles.card, {direction: isRTL ? 'rtl' : 'ltr'}]}>
        <ToggleRowItem title={t('NotificationSetting.payment')} initialValue />
        <ToggleRowItem title={t('NotificationSetting.tracking')} initialValue />
        <ToggleRowItem
          title={t('NotificationSetting.completeOrder')}
          initialValue
        />
        <ToggleRowItem
          title={t('NotificationSetting.notification')}
          initialValue
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

export default NotificationSetting;

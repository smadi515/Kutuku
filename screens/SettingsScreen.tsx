import React from 'react';
import {View, StyleSheet, ScrollView, Text} from 'react-native';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import {useTranslation} from 'react-i18next';

const SettingsScreen = ({navigation}: any) => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <ScrollView style={styles.container}>
      <Header
        showBack={true}
        showImage={false}
        title={t('settings.title')}
        rightIcons={[
          {
            name: 'info',
            type: 'AntDesign',
            onPress: () => {},
          },
        ]}
      />
      <View style={[styles.content, {direction: isRTL ? 'rtl' : 'ltr'}]}>
        <Text>{t('settings.general')}</Text>
        <CustomButton
          text={t('settings.edit_profile')}
          onPress={() => navigation.navigate('EditProfile')}
          icon="user"
          iconType="AntDesign"
          type="ICON_ROW"
        />
        <CustomButton
          text={t('settings.change_password')}
          onPress={() => navigation.navigate('ChangePassword')}
          icon="lock"
          iconType="AntDesign"
          type="ICON_ROW"
        />
        <CustomButton
          text={t('settings.notifications')}
          onPress={() => navigation.navigate('NotificationSetting')}
          icon="notifications"
          iconType="Ionicons"
          type="ICON_ROW"
        />
        <CustomButton
          text={t('settings.security')}
          onPress={() => navigation.navigate('SecurityScreen')}
          icon="security"
          iconType="MaterialCommunityIcons"
          type="ICON_ROW"
        />
        <CustomButton
          text={t('settings.language')}
          onPress={() => navigation.navigate('LanguageScreen')}
          icon="language"
          iconType="MaterialIcons"
          type="ICON_ROW"
        />
        <Text>{t('settings.preferences')}</Text>
        <CustomButton
          text={t('settings.legal')}
          onPress={() => navigation.navigate('LegalPolicies')}
          icon="sheriff-badge"
          iconType="Foundation"
          type="ICON_ROW"
        />
        <CustomButton
          text={t('settings.help')}
          onPress={() => navigation.navigate('HelpSupport')}
          icon="help-circle"
          iconType="Feather"
          type="ICON_ROW"
        />
        <CustomButton
          text={t('settings.logout')}
          onPress={() => navigation.navigate('Login')}
          icon="logout"
          iconType="MaterialCommunityIcons"
          type="ICON_ROW"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 5,
  },
});

export default SettingsScreen;

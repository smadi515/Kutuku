import React from 'react';
import {View, StyleSheet, ScrollView, Text, I18nManager} from 'react-native';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import {useTranslation} from 'react-i18next';

const SettingsScreen = ({navigation}: any) => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;

  return (
    <View style={styles.container}>
      <Header
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

      <View style={styles.scrollWrapper}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={{direction: isRTL ? 'rtl' : 'ltr'}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
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
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0FF',
    paddingTop: 10,
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  section: {
    backgroundColor: '#F5F0FF',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
});

export default SettingsScreen;

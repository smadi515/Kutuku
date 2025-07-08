import React from 'react';
import { View, StyleSheet, ScrollView, Text, I18nManager, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import Icon from '../components/icon';

const SettingsScreen = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionCard}>
          <View style={styles.accentBar} />
          <View style={styles.sectionContent}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="settings" type="Feather" size={22} color="#7B2FF2" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>{t('settings.general')}</Text>
            </View>
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
        </View>
        <View style={styles.sectionCard}>
          <View style={styles.accentBar} />
          <View style={styles.sectionContent}>
            <View style={styles.sectionHeaderRow}>
              <Icon name="star" type="Feather" size={22} color="#F357A8" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>{t('settings.preferences')}</Text>
            </View>
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
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Icon name="log-out" type="Feather" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.logoutBtnText}>{t('settings.logout') || 'Logout'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7FB',
    paddingTop: 0,
  },
  scrollContent: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  sectionCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 22,
    elevation: 2,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    alignItems: 'flex-start',
    minHeight: 80,
  },
  accentBar: {
    width: 6,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    backgroundColor: '#7B2FF2',
    height: '100%',
    minHeight: 120,
  },
  sectionContent: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7B2FF2',
    letterSpacing: 0.2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7B2FF2',
    borderRadius: 24,
    marginHorizontal: 18,
    marginBottom: 24,
    paddingVertical: 16,
    elevation: 3,
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.13,
    shadowRadius: 8,
  },
  logoutBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.2,
  },
});

export default SettingsScreen;

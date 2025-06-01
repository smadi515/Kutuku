import React, {useState, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Icon from '../components/icon';
import {login} from '../lib/api';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {useTranslation} from 'react-i18next';

const LoginScreen = ({navigation}: any) => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [email, setEmail] = useState(__DEV__ ? 'senan.smadi515@gmail.com' : '');
  const [password, setPassword] = useState(__DEV__ ? 'Kappa4Head123' : '');
  const [forgotEmail, setForgotEmail] = useState('');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);
  const openPaymentMethodSheet = () => bottomSheetRef.current?.expand();

  const handleResetPassword = async () => {
    try {
      const response = await fetch(
        'https://api.sareh-nomow.website/api/auth/password-reset/request',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email: forgotEmail}),
        },
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert(t('login.success'), t('login.checkEmail'));
        setForgotEmail('');
      } else {
        Alert.alert(t('login.error'), data.message || t('login.emailNotExist'));
      }
    } catch (error) {
      Alert.alert(t('login.error'), t('login.somethingWrong'));
    }
  };

  const handleLogin = async () => {
    try {
      const response = await login(email, password);

      if (response?.token && response?.user) {
        const token = response.token;
        const user = response.user;

        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        if (user?.full_name) {
          await AsyncStorage.setItem('userFullName', user.full_name);
        }

        navigation.replace('TabNavigationScreen');
      } else {
        Alert.alert(
          t('login.failed'),
          response.message || t('login.invalidCredentials'),
        );
      }
    } catch (error) {
      Alert.alert(t('login.error'), t('login.somethingWrong'));
    }
  };

  const handleGoogleLogin = () => {
    const googleLoginUrl = 'https://api.sareh-nomow.website/api/auth/google';
    Linking.openURL(googleLoginUrl);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {direction: isRTL ? 'rtl' : 'ltr'},
        ]}>
        <Text style={styles.title}>{t('login.title')}</Text>
        <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

        <CustomInput
          label={t('login.emailLabel')}
          placeholder={t('login.emailPlaceholder')}
          iconType="feather"
          iconName="mail"
          value={email}
          onChangeText={setEmail}
        />

        <CustomInput
          label={t('login.passwordLabel')}
          placeholder={t('login.passwordPlaceholder')}
          secureTextEntry
          iconType="feather"
          iconName="lock"
          value={password}
          onChangeText={setPassword}
        />

        <CustomButton
          text={t('login.forgotPassword')}
          type="TERTIARY"
          onPress={openPaymentMethodSheet}
        />

        <View style={{width: '100%', alignItems: 'center'}}>
          <CustomButton text={t('login.signIn')} onPress={handleLogin} />
        </View>

        <Text style={styles.orText}>{t('login.orOtherMethods')}</Text>

        <TouchableOpacity style={styles.altBtn} onPress={handleGoogleLogin}>
          <Icon type="ant" name="google" size={18} />
          <Text style={styles.altBtnText}>{t('login.google')}</Text>
        </TouchableOpacity>

        <View style={styles.altBtn}>
          <Icon type="fa" name="facebook" size={18} />
          <Text style={styles.altBtnText}>{t('login.facebook')}</Text>
        </View>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{alignItems: 'center', padding: 10}}>
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>{t('login.resetPassword')}</Text>
            <TextInput
              placeholder={t('login.enterEmail')}
              value={forgotEmail}
              onChangeText={setForgotEmail}
              style={styles.sheetInput}
            />
            <CustomButton
              text={t('login.submit')}
              onPress={handleResetPassword}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000',
  },
  subtitle: {
    color: 'gray',
    marginBottom: 30,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 15,
    color: 'gray',
  },
  altBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    padding: 12,
    borderRadius: 30,
    marginBottom: 15,
    justifyContent: 'center',
  },
  altBtnText: {
    marginLeft: 10,
    fontWeight: '500',
  },
  sheetContent: {
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
});

export default LoginScreen;

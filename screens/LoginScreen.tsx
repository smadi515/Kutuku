import React, {useState, useRef, useMemo, useEffect} from 'react';
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
import {login,} from '../lib/api';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import {useTranslation} from 'react-i18next';
import Header from '../components/Header';


const GOOGLE_LOGIN_URL = 'https://api.sareh-nomow.website/api/client/v1/auth/google';
const REDIRECT_URI = 'kutuku://auth-callback'; // Make sure this is registered in your app

const LoginScreen = ({navigation}: any) => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [email, setEmail] = useState(__DEV__ ? 'senan.smadi515@gmail.com' : '');
  const [password, setPassword] = useState(__DEV__ ? 'Kappa4Head123' : '');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmailError, setForgotEmailError] = useState('');
  const [lastResetRequestTime, setLastResetRequestTime] = useState<number | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);
  const openPaymentMethodSheet = () => bottomSheetRef.current?.expand();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.startsWith(REDIRECT_URI)) {
        // Example: kutuku://auth-callback?token=YOUR_TOKEN
        const match = event.url.match(/[?&]token=([^&]+)/);
        const token = match ? match[1] : null;
        if (token) {
          AsyncStorage.setItem('token', token);
          navigation.replace('TabNavigationScreen');
        }
      }
    };
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);

  const validateEmail = (email: string) => {
    const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()\[\]\\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\\.,;:\s@\"]+\.)+[^<>()[\]\\.,;:\s@\"]{2,})$/i;
    return re.test(String(email).toLowerCase());
  };

  const handleResetPassword = async () => {
    const now = Date.now();
    if (lastResetRequestTime && now - lastResetRequestTime < 60000) {
      Alert.alert(
        t('login.tooSoonTitle') || 'Please wait',
        t('login.tooSoonMsg') || 'You can request a new password only once per minute.'
      );
      return;
    }
    if (!forgotEmail) {
      setForgotEmailError(t('login.emailRequired') || 'Email is required');
      return;
    }
    if (!validateEmail(forgotEmail)) {
      setForgotEmailError(t('login.invalidEmail') || 'Invalid email address');
      return;
    }
    setForgotEmailError('');
    try {
      const response = await fetch(
        'https://api.sareh-nomow.xyz/api/auth/password-reset/request',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email: forgotEmail}),
        },
      );
      const data = await response.json();
      if (response.ok) {
        setLastResetRequestTime(now);
        Alert.alert(t('login.success'), t('login.checkEmail'));
        setForgotEmail('');
        bottomSheetRef.current?.close();
      } else {
        Alert.alert(t('login.error'), data.message || t('login.emailNotExist'));
      }
    } catch (error) {
      Alert.alert(t('login.error'), t('login.somethingWrong'));
    }
  };

  const handleLogin = async () => {
    setLoginLoading(true);
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
        const msg = (response && response.message) ? response.message.toLowerCase() : '';
        if (msg.includes('incorrect') || msg.includes('invalid credentials') || msg.includes('wrong password')) {
          Alert.alert(
            t('login.failed'),
            t('login.invalidCredentials') || 'Incorrect email or password.'
          );
        } else {
          Alert.alert(
            t('login.failed'),
            response.message || t('login.somethingWrong')
          );
        }
      }
    } catch (error) {
      Alert.alert(t('login.error'), t('login.somethingWrong'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleWebLogin = async () => {
    try {
      await Linking.openURL(GOOGLE_LOGIN_URL);
    } catch (error) {
      Alert.alert('Error', 'Could not open Google login.');
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#F7F7FB', paddingTop: 15}}>
      <Header title={t('login.title')} showBack={true} showImage={false} />
      <ScrollView contentContainerStyle={{flexGrow: 1, alignItems: 'center', paddingTop: 24}}>
        <View style={styles.card}>
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
            <CustomButton text={t('login.signIn')} onPress={handleLogin} loading={loginLoading} disabled={loginLoading} />
          </View>
          <Text style={styles.orText}>{t('login.orOtherMethods')}</Text>
          <TouchableOpacity style={styles.altBtn} onPress={handleGoogleWebLogin}>
            <Icon type="ant" name="google" size={18} />
            <Text style={styles.altBtnText}>{t('login.google')}</Text>
          </TouchableOpacity>
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
            <Text style={{marginBottom: 8, color: '#555', textAlign: 'center'}}>
              {t('login.forgotPasswordInstruction') || 'Enter your email to receive a password reset link.'}
            </Text>
            <TextInput
              placeholder={t('login.enterEmail')}
              value={forgotEmail}
              onChangeText={text => { setForgotEmail(text); setForgotEmailError(''); }}
              style={styles.sheetInput}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {!!forgotEmailError && (
              <Text style={{color: 'red', marginBottom: 8}}>{forgotEmailError}</Text>
            )}
            <CustomButton
              text={t('login.submit')}
              onPress={handleResetPassword}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    </View>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 32,
  },
});

export default LoginScreen;

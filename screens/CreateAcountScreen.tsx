import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Icon from '../components/icon';
import {register} from '../lib/api';
import {useTranslation} from 'react-i18next';

const CreateAccountScreen = ({navigation}: any) => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, sePhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const clearStorage = async () => {
      await AsyncStorage.clear();
      console.log('✅ AsyncStorage cleared');
    };

    clearStorage();
  }, []);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      setTimeout(async () => {
        const response = await register(email, password, username, phoneNumber);
        console.log('Register response:', response);

        if (
          response?.success ||
          response?.user ||
          response?.email ||
          response?.phoneNumber
        ) {
          await AsyncStorage.setItem('userFullName', username);
          navigation.navigate('OTPScreen', {email});
        } else {
          Alert.alert(
            t('error'),
            response.message || t('auth.registration_failed'),
          );
        }

        setIsLoading(false);
      }, 5000);
    } catch (error) {
      console.error(error);
      Alert.alert(t('error'), t('auth.generic_error'));
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {direction: isRTL ? 'rtl' : 'ltr'},
      ]}>
      <Text style={styles.title}>{t('auth.create_account')}</Text>
      <Text style={styles.subtitle}>{t('auth.create_account_subtitle')}</Text>

      <CustomInput
        label={t('auth.username')}
        placeholder={t('auth.username_placeholder')}
        iconType="feather"
        iconName="user"
        value={username}
        onChangeText={setUsername}
      />

      <CustomInput
        label={t('auth.email')}
        placeholder={t('auth.email_placeholder')}
        iconType="feather"
        iconName="mail"
        value={email}
        onChangeText={setEmail}
      />

      <CustomInput
        label={t('auth.password')}
        placeholder={t('auth.password_placeholder')}
        secureTextEntry
        iconType="feather"
        iconName="lock"
        value={password}
        onChangeText={setPassword}
      />

      <CustomInput
        label={t('auth.phone_number')}
        placeholder={t('auth.phone_placeholder')}
        iconType="feather"
        iconName="phone"
        value={phoneNumber}
        onChangeText={sePhoneNumber}
      />

      <View style={{width: '100%', alignItems: 'center'}}>
        <CustomButton
          text={
            isLoading ? t('auth.creating_account') : t('auth.create_account')
          }
          onPress={handleRegister}
          disabled={isLoading}
        />
      </View>

      <Text style={styles.orText}>{t('auth.or_use_other')}</Text>

      <View style={styles.altBtn}>
        <Icon type="ant" name="google" size={18} />
        <Text style={styles.altBtnText}>{t('auth.signup_google')}</Text>
      </View>

      <View style={styles.altBtn}>
        <Icon type="fa" name="facebook" size={18} />
        <Text style={styles.altBtnText}>{t('auth.signup_facebook')}</Text>
      </View>
    </ScrollView>
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
});

export default CreateAccountScreen;

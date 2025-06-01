import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import {verifyOtp} from '../lib/api';
import {useTranslation} from 'react-i18next';

const OTPScreen = ({route, navigation}: any) => {
  const {t} = useTranslation();
  const [otp, setOtp] = useState('');
  const {email} = route.params;

  const handleVerifyOtp = async () => {
    try {
      const lowercasedEmail = email.toLowerCase(); // ✅ normalize
      const response = await verifyOtp(lowercasedEmail, otp);

      console.log('OTP verify response:', response);

      if (response && response.is_email_verified) {
        navigation.navigate('Login');
      } else {
        Alert.alert(t('otpScreen.errorTitle'), t('otpScreen.errorInvalidOtp'));
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        t('otpScreen.errorTitle'),
        t('otpScreen.errorVerificationFailed'),
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('otpScreen.title')}</Text>
      <Text style={styles.subtitle}>{t('otpScreen.subtitle', {email})}</Text>

      <CustomInput
        label={t('otpScreen.otpLabel')}
        placeholder={t('otpScreen.otpPlaceholder')}
        iconType="feather"
        iconName="key"
        value={otp}
        onChangeText={setOtp}
      />

      <CustomButton
        text={t('otpScreen.verifyButton')}
        onPress={handleVerifyOtp}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    color: 'gray',
    marginBottom: 30,
  },
});

export default OTPScreen;

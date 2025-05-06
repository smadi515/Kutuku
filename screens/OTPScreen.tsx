import React, {useState} from 'react';
import {View, Text, StyleSheet, Alert} from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import {verifyOtp} from '../lib/api';

const OTPScreen = ({route, navigation}: any) => {
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
        Alert.alert('Error', 'Invalid OTP');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong during verification.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>We sent a code to {email}</Text>

      <CustomInput
        label="OTP Code"
        placeholder="Enter the code"
        iconType="feather"
        iconName="key"
        value={otp}
        onChangeText={setOtp}
      />

      <CustomButton text="Verify OTP" onPress={handleVerifyOtp} />
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

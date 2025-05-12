import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import React, {useMemo, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Icon from '../components/icon';
import {
  login,
  requestResetPassword,
  resetPassword,
  verifyOtp,
} from '../lib/api';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

const CreateAccountScreen = ({navigation}: any) => {
  const [email, setEmail] = useState(__DEV__ ? 'senan.smadi515@gmail.com' : '');
  const [password, setPassword] = useState(__DEV__ ? '12345678' : '');
  const [resetStep, setResetStep] = useState<'email' | 'otp' | 'password'>(
    'email',
  );
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [450], []);

  const openSummary = () => {
    setResetStep('email');
    bottomSheetRef.current?.snapToIndex(0);
  };

  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      console.log('Login response:', response);

      if (response?.token) {
        const fullName = response?.user?.full_name;
        if (fullName) {
          await AsyncStorage.setItem('userFullName', fullName);
          console.log('✅ Full name saved:', fullName);
        }
        navigation.navigate('Home');
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleResetStep = async () => {
    try {
      if (resetStep === 'email') {
        const res = await requestResetPassword(resetEmail);
        if (res?.success) {
          setResetStep('otp');
        } else {
          Alert.alert('Error', res.message || 'Failed to send reset email.');
        }
      } else if (resetStep === 'otp') {
        const res = await verifyOtp(resetEmail, otp);
        if (res?.success) {
          setResetStep('password');
        } else {
          Alert.alert('Error', res.message || 'Invalid OTP.');
        }
      } else if (resetStep === 'password') {
        if (newPassword !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match.');
          return;
        }
        const res = await resetPassword(resetEmail, otp, newPassword);
        if (res?.success) {
          Alert.alert('Success', 'Password has been reset.');
          bottomSheetRef.current?.close();
        } else {
          Alert.alert('Error', res.message || 'Failed to reset password.');
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Login Account</Text>
      <Text style={styles.subtitle}>please login with registered account </Text>

      <CustomInput
        label="Email"
        placeholder="Enter your email "
        iconType="feather"
        iconName="mail"
        value={email}
        onChangeText={setEmail}
      />

      <CustomInput
        label="Password"
        placeholder="password"
        secureTextEntry
        iconType="feather"
        iconName="lock"
        value={password}
        onChangeText={setPassword}
      />

      <CustomButton
        text="Forgot Password?"
        onPress={openSummary}
        type="TERTIARY"
      />

      <View style={{width: '100%', alignItems: 'center'}}>
        <CustomButton text="Sign In" onPress={handleLogin} />
      </View>

      <Text style={styles.orText}>Or using other method</Text>

      <View style={styles.altBtn}>
        <Icon type="ant" name="google" size={18} />
        <Text style={styles.altBtnText}>Sign in with Google</Text>
      </View>

      <View style={styles.altBtn}>
        <Icon type="fa" name="facebook" size={18} />
        <Text style={styles.altBtnText}>Sign in with Facebook</Text>
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{padding: 20, flex: 1}}>
          {resetStep === 'email' && (
            <>
              <Text style={{fontWeight: 'bold', marginBottom: 10}}>
                Enter your email
              </Text>
              <CustomInput
                label="Email"
                placeholder="Enter your email"
                value={resetEmail}
                onChangeText={setResetEmail}
              />
              <CustomButton text="Send Code" onPress={handleResetStep} />
            </>
          )}
          {resetStep === 'otp' && (
            <>
              <Text style={{fontWeight: 'bold', marginBottom: 10}}>
                Enter verification code
              </Text>
              <CustomInput
                label="OTP"
                placeholder="Enter code"
                value={otp}
                onChangeText={setOtp}
              />
              <CustomButton text="Verify Code" onPress={handleResetStep} />
            </>
          )}
          {resetStep === 'password' && (
            <>
              <Text style={{fontWeight: 'bold', marginBottom: 10}}>
                Set new password
              </Text>
              <CustomInput
                label="New Password"
                placeholder="Enter new password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <CustomInput
                label="Confirm Password"
                placeholder="Confirm password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <CustomButton text="Reset Password" onPress={handleResetStep} />
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
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

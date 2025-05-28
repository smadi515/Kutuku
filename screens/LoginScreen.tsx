import React, {useState, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Icon from '../components/icon';
import {login} from '../lib/api';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

const CreateAccountScreen = ({navigation}: any) => {
  const [email, setEmail] = useState(__DEV__ ? 'senan.smadi515@gmail.com' : '');
  const [password, setPassword] = useState(__DEV__ ? 'Kappa4Head123' : '');
  const [forgotEmail, setForgotEmail] = useState('');
  const bottomSheetRef = useRef<BottomSheet>(null); // Payment method selection sheet
  const snapPoints = useMemo(() => ['40%'], []);
  const openPaymentMethodSheet = () => bottomSheetRef.current?.expand();

  const handleResetPassword = async () => {
    try {
      const response = await fetch(
        'https://api.sareh-nomow.website/api/auth/password-reset/request',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({email}),
        },
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Go to your email and change your password.');
        setEmail('');
      } else {
        Alert.alert('Error', data.message || 'Email does not exist.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };
  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      console.log('Login response:', response);

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
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Login Account</Text>
        <Text style={styles.subtitle}>
          please login with registered account
        </Text>

        <CustomInput
          label="Email"
          placeholder="Enter your email"
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
          type="TERTIARY"
          onPress={openPaymentMethodSheet}
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
      </ScrollView>

      {/* Inline Bottom Sheet for Forgot Password */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose>
        <BottomSheetView style={{alignItems: 'center', padding: 10}}>
          <View style={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Reset Password</Text>
            <TextInput
              placeholder="Enter your email"
              value={forgotEmail}
              onChangeText={setForgotEmail}
              style={styles.sheetInput}
            />
            <CustomButton text="Submit" onPress={handleResetPassword} />
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

export default CreateAccountScreen;

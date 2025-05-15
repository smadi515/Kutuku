import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import React, {useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Icon from '../components/icon';
import {login} from '../lib/api';

const CreateAccountScreen = ({navigation}: any) => {
  const [email, setEmail] = useState(__DEV__ ? 'senan.smadi515@gmail.com' : '');
  const [password, setPassword] = useState(__DEV__ ? '12345678' : '');

  const handleLogin = async () => {
    try {
      const response = await login(email, password);
      console.log('Login response:', response);

      if (response?.token && response?.user) {
        const token = response.token;
        const user = response.user;

        // ✅ Save token and user to AsyncStorage
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        console.log('✅ Token and user saved to storage');

        if (user?.full_name) {
          await AsyncStorage.setItem('userFullName', user.full_name);
        }

        // ✅ Navigate to Home
        navigation.replace('Home');
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Login Account</Text>
      <Text style={styles.subtitle}>please login with registered account </Text>

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

      <CustomButton text="Forgot Password?" type="TERTIARY" />

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

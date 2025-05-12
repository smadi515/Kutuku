import {View, Text, StyleSheet, ScrollView, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅ استيراد AsyncStorage

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Icon from '../components/icon';
import {register} from '../lib/api';

const CreateAccountScreen = ({navigation}: any) => {
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
    setIsLoading(true); // Show loading

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
          // ✅ حفظ الاسم الكامل
          await AsyncStorage.setItem('userFullName', username);

          navigation.navigate('OTPScreen', {email});
        } else {
          Alert.alert('Error', response.message || 'Registration failed');
        }

        setIsLoading(false); // Hide loading after response
      }, 5000);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>
        Start learning with create your account
      </Text>

      <CustomInput
        label="Username"
        placeholder="Create your username"
        iconType="feather"
        iconName="user"
        value={username}
        onChangeText={setUsername}
      />

      <CustomInput
        label="Email "
        placeholder="Enter your email"
        iconType="feather"
        iconName="mail"
        value={email}
        onChangeText={setEmail}
      />

      <CustomInput
        label="Password"
        placeholder="Create your password"
        secureTextEntry
        iconType="feather"
        iconName="lock"
        value={password}
        onChangeText={setPassword}
      />
      <CustomInput
        label="Phone Number"
        placeholder="Enter Phone Number"
        iconType="feather"
        iconName="lock"
        value={phoneNumber}
        onChangeText={sePhoneNumber}
      />

      <View style={{width: '100%', alignItems: 'center'}}>
        <CustomButton
          text={isLoading ? 'Creating Account...' : 'Create Account'}
          onPress={handleRegister}
          disabled={isLoading}
        />
      </View>

      <Text style={styles.orText}>Or using other method</Text>

      <View style={styles.altBtn}>
        <Icon type="ant" name="google" size={18} />
        <Text style={styles.altBtnText}>Sign Up with Google</Text>
      </View>

      <View style={styles.altBtn}>
        <Icon type="fa" name="facebook" size={18} />
        <Text style={styles.altBtnText}>Sign Up with Facebook</Text>
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

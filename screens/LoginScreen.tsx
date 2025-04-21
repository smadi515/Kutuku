import {View, Text, StyleSheet, ScrollView} from 'react-native';
import React from 'react';

import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import Icon from '../components/icon';

const CreateAccountScreen = ({navigation}: any) => {
  const handleNext = () => {
    navigation.navigate('Home');
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Login Account</Text>
      <Text style={styles.subtitle}>please login with registered account </Text>

      <CustomInput
        label="Email or Phone Number"
        placeholder="Enter your email or phone number"
        iconType="feather"
        iconName="mail"
      />

      <CustomInput
        label="Password"
        placeholder="password"
        secureTextEntry
        iconType="feather"
        iconName="lock"
      />

      <CustomButton
        text="Forgot Password?"
        onPress={() => {
          navigation.navigate('Home');
        }}
        type="TERTIARY"
      />

      <View style={{width: '100%', alignItems: 'center'}}>
        <CustomButton
          text="Sign In"
          onPress={() => {
            handleNext;
          }}
        />
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

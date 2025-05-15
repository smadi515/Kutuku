import React, {useEffect} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../App'; // Adjust path if needed

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const SplashScreen: React.FC<SplashScreenProps> = ({navigation}) => {
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const onboardingSeen = await AsyncStorage.getItem('onboardingSeen');

        const user = userData ? JSON.parse(userData) : null;

        if (user && user.id) {
          navigation.replace('Home');
        } else if (onboardingSeen) {
          navigation.replace('Login');
        } else {
          navigation.replace('Onboarding');
        }
      } catch (err) {
        console.error('SplashScreen check failed:', err);
        navigation.replace('Login');
      }
    };

    const timeout = setTimeout(checkAuthStatus, 1500);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={{fontSize: 45, color: 'white'}}>Kutuku</Text>
        <Text style={{fontSize: 10, color: 'white'}}>
          Any shopping just from home
        </Text>
        <ActivityIndicator
          size="large"
          color="#00BCD4"
          style={{marginTop: 20}}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'purple',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 150,
    marginBottom: 10,
  },
});

export default SplashScreen;

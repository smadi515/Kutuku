import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {ActivityIndicator, View, I18nManager} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import StoreScreen from './screens/StoreScreen';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import OnboardingFlow from './screens/OnboardingFlow';
import CreateAcountScreen from './screens/CreateAcountScreen';
import MyOrders from './screens/MyOrders';
import Favorites from './screens/Favorites';
import Profile from './screens/Profile';
import TabNavigationScreen from './screens/TabNavigationScreen';
import SearchScreen from './screens/SearchScreen';
import CartScreen from './screens/CartScreen';
import PaymentScreen from './screens/PaymentScreen';
import NotificationScreen from './screens/NotificationScreen';
import ProductsDetails from './screens/ProductsDetails';
import SettingsScreen from './screens/SettingsScreen';
import ChangePassword from './screens/ChangePassword';
import LegalPolicies from './screens/LegalPolicies';
import EditProfile from './screens/EditProfile.screen';
import SecurityScreen from './screens/SecurityScreen';
import NotificationSetting from './screens/NotificationSetting';
import LanguageScreen from './screens/LanguageScreen';
import HelpSupport from './screens/HelpSupport';
import AddressScreen from './screens/AddressScreen';
import OTPScreen from './screens/OTPScreen';
import EditAddressScreen from './screens/EditAddressScreen';
import Home from './screens/HomeScreen';
// Prevent RTL layout
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

// Cart item type used across app
export type CartItem = {
  id: string; // Product ID
  title: string; // Product name
  price: number; // Unit price
  quantity: number; // Quantity selected
  selected: boolean; // For UI selection states
  image: string; // Product image URL
};

// Navigation type definitions
export type RootStackParamList = {
  TabNavigationScreen: undefined;
  Splash: undefined;
  Login: undefined;
  OTPScreen: undefined;
  CreateAcount: undefined;
  Onboarding: undefined;
  Home: undefined;
  EditProfile: undefined;
  Favorites: undefined;
  Profile: {
    fullName: string;
    birthday: string;
    phoneNumber: string;
  };
  StoreScreen: {categoryId?: number; brandId?: number};
  ChangePassword: undefined;
  MyOrders: undefined;
  SettingsScreen: undefined;
  HelpSupport: undefined;
  AddressScreen: undefined;
  SecurityScreen: undefined;
  NotificationSetting: undefined;
  NotificationScreen: undefined;
  ProductsDetails: {product_id: number};
  LegalPolicies: undefined;
  LanguageScreen: undefined;
  CartScreen: undefined;
  PaymentScreen: {
    cartId: number | null;
    addressId: number;
    shippingCost: number;
    shippingMethodName: string;
    shippingZoneMethodId: number; // ✅ Add this line
  }; // <-- Add expected param
  SearchScreen: undefined;
  EditAddressScreen: {addressId: number}; // New screen for editing address
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [initialRoute, setInitialRoute] = useState<
    keyof RootStackParamList | null
  >(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      setInitialRoute(token ? 'Home' : 'Splash');
    };
    checkLoginStatus();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="OTPScreen" component={OTPScreen} />
          <Stack.Screen name="CreateAcount" component={CreateAcountScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingFlow} />
          <Stack.Screen
            name="TabNavigationScreen"
            component={TabNavigationScreen}
          />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="Favorites" component={Favorites} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="StoreScreen" component={StoreScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
          <Stack.Screen
            name="EditAddressScreen"
            component={EditAddressScreen}
          />
          <Stack.Screen name="MyOrders" component={MyOrders} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupport} />
          <Stack.Screen name="AddressScreen" component={AddressScreen} />
          <Stack.Screen name="SecurityScreen" component={SecurityScreen} />
          <Stack.Screen
            name="NotificationSetting"
            component={NotificationSetting}
          />
          <Stack.Screen
            name="NotificationScreen"
            component={NotificationScreen}
          />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="ProductsDetails" component={ProductsDetails} />
          <Stack.Screen name="LegalPolicies" component={LegalPolicies} />
          <Stack.Screen name="LanguageScreen" component={LanguageScreen} />
          <Stack.Screen name="CartScreen" component={CartScreen} />
          <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;

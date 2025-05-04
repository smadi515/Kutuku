import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import StoreScreen from './screens/StoreScreen';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import OnboardingFlow from './screens/OnboardingFlow';
import CreateAcountScreen from './screens/CreateAcountScreen';
import {I18nManager} from 'react-native';
import MyOrders from './screens/MyOrders';
import Favorites from './screens/Favorites';
import Profile from './screens/Profile';
import TabNavigationScreen from './screens/TabNavigationScreen';
import SearchScreen from './components/SearchScreen';
import CartScreen from './screens/CartScreen';
import PaymentScreen from './screens/PaymentScreen';
import NotificationScreen from './screens/NotificationScreen';
import ProductsDetails from './screens/ProductsDetails';
import {ImageSourcePropType} from 'react-native';
import SettingsScreen from './screens/SettingsScreen';
import ChangePassword from './screens/ChangePassword';
import LegalPolicies from './screens/LegalPolicies';
import EditProfile from './screens/EditProfile.screen';
import SecurityScreen from './screens/SecurityScreen';
import NotificationSetting from './screens/NotificationSetting';
import LanguageScreen from './screens/LanguageScreen';
import HelpSupport from './screens/HelpSupport';
type ColorOption = {
  color: string;
  image: ImageSourcePropType; // More specific type for image
};
I18nManager.allowRTL(false); // Disables RTL layout support
I18nManager.forceRTL(false);
export type RootStackParamList = {
  SecurityScreen: undefined;
  Splash: undefined;
  HelpSupport: undefined;
  LanguageScreen: undefined;
  Login: undefined;
  LegalPolicies: undefined;
  Onboarding: undefined;
  Home: undefined;
  MyOrders: undefined;
  EditProfile: undefined;
  Favorites: undefined;
  Profile: undefined;
  CreateAcount: undefined;
  SearchScreen: undefined;
  CartScreen: undefined;
  SettingsScreen: undefined;
  ChangePassword: undefined;
  NotificationSetting: undefined;
  StoreScreen: undefined;
  NotificationScreen: undefined;
  ProductsDetails: {
    title: string;
    designer: string;
    price: number;
    image: ImageSourcePropType;
    isFavorite: boolean;
    colors: ColorOption[];
    rating: number;
    reviewCount: number;
    stock: string;
    description: string;
  };
  PaymentScreen: {
    selectedItems: CartItem[];
    subtotal: number;
    total: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CreateAcount" component={CreateAcountScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingFlow} />
          <Stack.Screen name="Home" component={TabNavigationScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
          <Stack.Screen name="MyOrders" component={MyOrders} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupport} />

          <Stack.Screen name="SecurityScreen" component={SecurityScreen} />
          <Stack.Screen
            name="NotificationSetting"
            component={NotificationSetting}
          />

          <Stack.Screen name="StoreScreen" component={StoreScreen} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="LegalPolicies" component={LegalPolicies} />
          <Stack.Screen name="ProductsDetails" component={ProductsDetails} />
          <Stack.Screen name="LanguageScreen" component={LanguageScreen} />

          <Stack.Screen
            name="NotificationScreen"
            component={NotificationScreen}
          />
          <Stack.Screen name="Favorites" component={Favorites} />
          <Stack.Screen
            name="CartScreen"
            component={CartScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;

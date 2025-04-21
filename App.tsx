import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

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
I18nManager.allowRTL(false); // Disables RTL layout support
I18nManager.forceRTL(false);
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Onboarding: undefined;
  Home: undefined;
  MyOrders: undefined;
  Favorites: undefined;
  Profile: undefined;
  CreateAcount: undefined;
  SearchScreen: undefined;
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
          <Stack.Screen name="MyOrders" component={MyOrders} />
          <Stack.Screen name="Favorites" component={Favorites} />
          <Stack.Screen name="SearchScreen" component={SearchScreen} />
          <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;

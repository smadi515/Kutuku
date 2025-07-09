import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MyOrders from './MyOrders';
import Profile from './Profile';
import Home from '../screens/HomeScreen'; // Make sure path is correct
import Icon from '../components/icon'; // Make sure path is correct
import {useTranslation} from 'react-i18next';
import SettingsScreen from './SettingsScreen';
import StoreScreen from './StoreScreen';

const Tab = createBottomTabNavigator();

const TabNavigationScreen = () => {
  const {t} = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: 'purple',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: {fontSize: 12},
        tabBarStyle: {backgroundColor: '#eee'},
        tabBarIcon: ({color, size}) => {
          let iconName = '';
          let type = 'feather'; // default

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              type = 'feather';
              break;
            case 'MyOrders':
              iconName = 'shopping-bag';
              type = 'feather';
              break;
            case 'SettingsScreen':
              iconName = 'settings';
              type = 'feather';
              break;
            case 'Profile':
              iconName = 'user';
              type = 'feather';
              break;
          }

          return <Icon name={iconName} type={type} color={color} size={size} />;
        },
      })}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{tabBarLabel: t('TabNavigationScreen.home')}}
      />
      <Tab.Screen
        name="Store"
        component={StoreScreen}
        options={{
          tabBarLabel: t('TabNavigationScreen.store') || 'Store',
          tabBarIcon: ({color, size}) => (
            <Icon name="shopping-bag" type="feather" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MyOrders"
        component={MyOrders}
        options={{tabBarLabel: t('TabNavigationScreen.my_orders')}}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{tabBarLabel: t('TabNavigationScreen.profile')}}
      />
      <Tab.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{tabBarLabel: t('TabNavigationScreen.Settings')}}
      />
    </Tab.Navigator>
  );
};

export default TabNavigationScreen;

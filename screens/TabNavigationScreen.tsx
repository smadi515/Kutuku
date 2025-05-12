// HomeScreen.tsx
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MyOrders from './MyOrders';
import Favorites from './Favorites';
import Profile from './Profile';
import Home from '../screens/HomeScreen'; // Make sure path is correct
import Icon from '../components/icon'; // Make sure path is correct

const Tab = createBottomTabNavigator();

const HomeScreen = () => {
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
            case 'Favorites':
              iconName = 'heart';
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
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="MyOrders" component={MyOrders} />
      <Tab.Screen name="Favorites" component={Favorites} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default HomeScreen;

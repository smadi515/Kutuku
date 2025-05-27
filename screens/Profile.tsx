import React from 'react';
import {View, Text, StatusBar, StyleSheet} from 'react-native';
import Header from '../components/Header';
import Icon from '../components/icon'; // adjust the path if necessary
import {useRoute, useNavigation} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {RootStackParamList} from '../App';

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

const Profile = () => {
  const route = useRoute<ProfileScreenRouteProp>();
  const navigation = useNavigation();

  const {
    fullName = 'Unknown',
    birthday = new Date().toISOString(),
    phoneNumber = 'Unknown',
  } = route.params || {};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Header
        title="Profile"
        showImage={false}
        rightIcons={[
          {
            name: 'settings-outline',
            type: 'ionicon',
            onPress: () => navigation.navigate('SettingsScreen'),
          },
        ]}
      />

      <View style={styles.card}>
        <Icon
          name="person-circle-outline"
          type="ionicon"
          size={80}
          color="purple"
        />
        <Text style={styles.name}>{fullName}</Text>

        <View style={styles.infoRow}>
          <Icon name="call-outline" type="ionicon" size={20} color="purple" />
          <Text style={styles.infoText}>{phoneNumber}</Text>
        </View>

        <View style={styles.infoRow}>
          <Icon
            name="calendar-outline"
            type="ionicon"
            size={20}
            color="purple"
          />
          <Text style={styles.infoText}>
            {new Date(birthday).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  card: {
    marginTop: 50,
    backgroundColor: '#F5F0FF',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: 'purple',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#333',
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#555',
  },
});

import React, {useEffect, useState} from 'react';
import {View, Text, StatusBar, StyleSheet} from 'react-native';
import Header from '../components/Header';
import Icon from '../components/icon';
import {useTranslation} from 'react-i18next';
import {fetchUserProfile} from '../lib/api'; // adjust path if needed

const Profile = () => {
  const {t} = useTranslation();
  const [fullName, setFullName] = useState('Unknown');
  const [birthday, setBirthday] = useState(new Date().toISOString());
  const [phoneNumber, setPhoneNumber] = useState('Unknown');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await fetchUserProfile();
        setFullName(user.full_name || 'Unknown');
        setBirthday(user.birthday || new Date().toISOString());
        setPhoneNumber(user.phone_number || 'Unknown');
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };

    loadUserData();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <Header title={t('profile.title')} showImage={false} />

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
          <Text style={styles.infoText}>
            {t('profile.phone')}: {phoneNumber}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Icon
            name="calendar-outline"
            type="ionicon"
            size={20}
            color="purple"
          />
          <Text style={styles.infoText}>
            {t('profile.birthday')}: {new Date(birthday).toLocaleDateString()}
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

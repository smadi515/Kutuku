import React, {useEffect, useState} from 'react';
import {View, Text, StatusBar, StyleSheet, TouchableOpacity, Image, SafeAreaView} from 'react-native';
import Header from '../components/Header';
import Icon from '../components/icon';
import {useTranslation} from 'react-i18next';
import {fetchUserProfile} from '../lib/api'; // adjust path if needed
import LinearGradient from 'react-native-linear-gradient';

const Profile = ({navigation}: any) => {
  const {t} = useTranslation();
  const [fullName, setFullName] = useState('Unknown');
  const [birthday, setBirthday] = useState(new Date().toISOString());
  const [phoneNumber, setPhoneNumber] = useState('Unknown');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await fetchUserProfile();
        setFullName(user.full_name || 'Unknown');
        setBirthday(user.birthday || new Date().toISOString());
        setPhoneNumber(user.phone_number || 'Unknown');
        setEmail(user.email || '');
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    };
    loadUserData();
  }, []);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <StatusBar barStyle="light-content" backgroundColor="#7B2FF2" />
      <LinearGradient colors={["#7B2FF2", "#F357A8"]} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.8}>
            <Icon
              name="person-circle-outline"
              type="ionicon"
              size={110}
              color="#fff"
              style={styles.avatarIcon}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      <View style={styles.cardOverlapContainer}>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.fabEditBtn}
            activeOpacity={0.85}
            onPress={() => navigation && navigation.navigate && navigation.navigate('EditProfile')}
          >
            <Icon name="edit" type="Feather" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.cardName}>{fullName}</Text>
          <View style={styles.infoRow}>
            <Icon name="call-outline" type="ionicon" size={22} color="#7B2FF2" />
            <Text style={styles.infoText}>{t('profile.phone')}: {phoneNumber}</Text>
          </View>
          {email ? (
            <View style={styles.infoRow}>
              <Icon name="mail-outline" type="ionicon" size={22} color="#7B2FF2" />
              <Text style={styles.infoText}>{t('profile.email')}: {email}</Text>
            </View>
          ) : null}
          <View style={styles.infoRow}>
            <Icon name="calendar-outline" type="ionicon" size={22} color="#7B2FF2" />
            <Text style={styles.infoText}>{t('profile.birthday')}: {new Date(birthday).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  headerGradient: {
    height: 260,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    borderWidth: 4,
    borderColor: '#fff',
    borderRadius: 60,
    padding: 2,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  avatarIcon: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  headerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  fabEditBtn: {
    position: 'absolute',
    top: -22,
    right: 22,
    backgroundColor: '#7B2FF2',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 10,
  },
  flexGrowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 0,
  },
  cardOverlapContainer: {
    alignItems: 'center',
    marginTop: -60, // overlap the header gradient
    marginBottom: 0,
    zIndex: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'flex-start',
    width: '92%',
    shadowColor: '#7B2FF2',
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  infoText: {
    fontSize: 17,
    marginLeft: 14,
    color: '#333',
    fontWeight: '500',
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
});

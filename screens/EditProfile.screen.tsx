import React, {useState, useEffect} from 'react';
import {View, ScrollView, StatusBar, Text, Switch, Alert} from 'react-native';
import DatePicker from 'react-native-date-picker';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../App';
const EditProfile = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [fullName, setFullName] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [isNewsletterAccepted, setIsNewsletterAccepted] = useState(false);
  const [userId, setUserId] = useState('');
  const [formChanged, setFormChanged] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [initialPhoneNumber, setInitialPhoneNumber] = useState('');
  const [initialFullName, setInitialFullName] = useState('');
  const [initialBirthday, setInitialBirthday] = useState(new Date());
  const [initialNewsletter, setInitialNewsletter] = useState(false);

  const LOCAL_STORAGE_KEY = 'profileDraft';

  const checkFormChanged = (
    name: string,
    bday: Date,
    newsletter: boolean,
    phone: string,
  ) => {
    return (
      name !== initialFullName ||
      bday.getTime() !== initialBirthday.getTime() ||
      newsletter !== initialNewsletter ||
      phone !== initialPhoneNumber
    );
  };

  const saveDraftToStorage = async (
    name: string,
    bday: Date,
    newsletter: boolean,
    phone: string,
  ) => {
    await AsyncStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        fullName: name,
        birthday: bday.toISOString(),
        isNewsletterAccepted: newsletter,
        phoneNumber: phone,
      }),
    );
  };

  const handleFullNameChange = (text: string) => {
    setFullName(text);
    setFormChanged(
      checkFormChanged(text, birthday, isNewsletterAccepted, phoneNumber),
    );
    saveDraftToStorage(text, birthday, isNewsletterAccepted, phoneNumber);
  };

  const handleBirthdayChange = (date: Date) => {
    setBirthday(date);
    setFormChanged(
      checkFormChanged(fullName, date, isNewsletterAccepted, phoneNumber),
    );
    saveDraftToStorage(fullName, date, isNewsletterAccepted, phoneNumber);
  };

  const handleNewsletterChange = (value: boolean) => {
    setIsNewsletterAccepted(value);
    setFormChanged(checkFormChanged(fullName, birthday, value, phoneNumber));
    saveDraftToStorage(fullName, birthday, value, phoneNumber);
  };
  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    setFormChanged(
      checkFormChanged(fullName, birthday, isNewsletterAccepted, text),
    );
    saveDraftToStorage(fullName, birthday, isNewsletterAccepted, text);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');

        if (userData && token) {
          const parsed = JSON.parse(userData);
          setUserId(parsed?.id);

          const res = await fetch(
            `https://api.sareh-nomow.xyz/api/user/profile/${parsed.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (res.ok) {
            const profile = await res.json();
            const bday = new Date(profile.birthday);

            setInitialFullName(profile.full_name);
            setInitialBirthday(bday);
            setInitialNewsletter(profile.is_newsletter_accepted);

            const savedDraft = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);

            if (savedDraft) {
              const draft = JSON.parse(savedDraft);
              setFullName(draft.fullName);
              setBirthday(new Date(draft.birthday));
              setIsNewsletterAccepted(draft.isNewsletterAccepted);
              setPhoneNumber(draft.phoneNumber);
            } else {
              setFullName(profile.full_name);
              setBirthday(bday);
              setIsNewsletterAccepted(profile.is_newsletter_accepted);
              setPhoneNumber(profile.phone_number);
            }

            setFormChanged(false);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      if (phoneNumber.length < 10) {
        Alert.alert(
          'Invalid Phone Number',
          'Phone number must be at least 10 digits.',
        );
        return;
      }

      const token = await AsyncStorage.getItem('token');

      const res = await fetch(
        `https://api.sareh-nomow.xyz/api/user/profile/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: fullName,
            birthday: birthday.toISOString(),
            is_newsletter_accepted: isNewsletterAccepted,
            phone_number: phoneNumber,
          }),
        },
      );

      const data = await res.json();
      if (phoneNumber.length < 10) {
        Alert.alert(
          'Invalid Phone Number',
          'Phone number must be at least 10 digits.',
        );
        return;
      }
      if (res.ok) {
        Alert.alert('Profile updated successfully!');
        await AsyncStorage.removeItem(LOCAL_STORAGE_KEY);

        setInitialFullName(fullName);
        setInitialBirthday(birthday);
        setInitialNewsletter(isNewsletterAccepted);
        setInitialPhoneNumber(phoneNumber);
        setFormChanged(false);

        navigation.navigate('Profile', {
          fullName: fullName,
          birthday: birthday.toISOString(),
          phoneNumber: phoneNumber,
        });
      } else {
        console.log('API Error Response:', data);
        Alert.alert('Error: ' + (data.message || 'Something went wrong.'));
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Failed to update profile.');
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: '#fff', padding: 16}}>
      <Header
        showBack={true}
        showImage={false}
        title="Edit Profile"
        rightIcons={[
          {
            name: 'info',
            type: 'AntDesign',
            onPress: () => {},
          },
        ]}
      />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <CustomInput
          label="Full Name"
          iconType="materialcommunity"
          iconName="account"
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={handleFullNameChange}
        />
        <CustomInput
          label="Phone Number"
          iconType="feather"
          iconName="phone"
          placeholder="Enter your phone number"
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
        />
        <Text style={{marginTop: 20, marginBottom: 8}}>Birthday</Text>
        <DatePicker
          date={birthday}
          mode="date"
          onDateChange={handleBirthdayChange}
        />

        <View
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
          <Text style={{flex: 1}}>Accept Newsletter</Text>
          <Switch
            value={isNewsletterAccepted}
            onValueChange={handleNewsletterChange}
          />
        </View>
      </ScrollView>

      <View style={{alignItems: 'center', marginTop: 20}}>
        <CustomButton
          text="Save Changes"
          iconColor="white"
          onPress={handleSave}
          disabled={!formChanged}
        />
      </View>
    </View>
  );
};

export default EditProfile;

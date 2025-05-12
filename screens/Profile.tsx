import React, {useState} from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';

import CustomInput from '../components/CustomInput';
import ImagePickerComponent from '../components/ImagePickerComponent';
import Icon from '../components/icon';
import Header from '../components/Header';

const Profile = () => {
  const [image, setImage] = useState<any>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);

  const handleImagePick = (asset: any) => {
    setImage(asset);
    console.log({password});
    console.log({phoneNumber});
    console.log({name});
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  return (
    <View style={{flex: 1, backgroundColor: '#fff', padding: 16}}>
      <Header
        showBack={true}
        showImage={false}
        title="Profile"
        rightIcons={[
          {
            name: 'info',
            type: 'AntDesign',
            onPress: () => {},
          },
        ]}
      />
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Profile Image */}
      <View style={{alignItems: 'center', marginBottom: 20}}>
        <ImagePickerComponent
          image={image}
          onPick={handleImagePick}
          extraStyle={{
            width: 150,
            height: 150,
            borderRadius: 75,
            backgroundColor: '#f0f0f0',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
          customIcon={
            <View style={{alignItems: 'center'}}>
              <Icon name="camera" type="feather" size={28} color="#666" />
              <Text style={{color: '#666', marginTop: 5}}>Add Photo</Text>
            </View>
          }
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <CustomInput
          label="Full Name"
          iconType="materialcommunity"
          iconName="account"
          onChangeText={setName}
          placeholder="Enter your full name"
        />
        <CustomInput
          label="Password"
          iconType="materialcommunity"
          iconName="lock-outline"
          secureTextEntry={isPasswordVisible}
          onChangeText={setPassword}
          placeholder="Enter your password"
        />
        <TouchableOpacity
          style={{position: 'absolute', top: 162, right: 30}}
          onPress={togglePasswordVisibility}>
          <Icon
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            type="feather"
            size={20}
            color="#888"
          />
        </TouchableOpacity>

        <CustomInput
          label="Phone Number"
          iconType="fontawesome"
          iconName="phone"
          onChangeText={setPhoneNumber}
          placeholder="Enter your phone number"
        />
      </ScrollView>
    </View>
  );
};

export default Profile;

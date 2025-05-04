import {View} from 'react-native';
import React from 'react';
import Header from '../components/Header';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

const ChangePassword = () => {
  return (
    <View style={{flex: 1}}>
      <Header
        showImage={false}
        title="Change Password"
        showBack={true}
        rightIcons={[
          {
            name: 'info',
            type: 'AntDesign',
            onPress: () => {},
          },
        ]}
      />
      <View style={{padding: 1}}>
        <CustomInput
          label="New Password"
          placeholder="Enter New Password"
          secureTextEntry
          iconType="feather"
          iconName="lock"
        />
        <CustomInput
          label="Confirm Password"
          placeholder="Confirm Your New Password"
          secureTextEntry
          iconType="feather"
          iconName="lock"
        />
      </View>
      <View
        style={{
          alignItems: 'center',
          width: '100%',
          height: 50,
          position: 'absolute',
          bottom: 20,
        }}>
        <CustomButton text="Change Now " type="PRIMARY" />
      </View>
    </View>
  );
};

export default ChangePassword;

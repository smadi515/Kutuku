import {View} from 'react-native';
import React from 'react';
import Header from '../components/Header';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import {useTranslation} from 'react-i18next';

const ChangePassword = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  return (
    <View style={{flex: 1, paddingTop: 10}}>
      <Header
        showImage={false}
        title={t('ChangePassword.title')}
        showBack={true}
      

      />
      <View style={{paddingHorizontal: 15,  direction: isRTL ? 'rtl' : 'ltr'}}>
        <CustomInput
          label={t('ChangePassword.newPassword')}
          placeholder={t('ChangePassword.newPasswordPlaceholder')}
          secureTextEntry
          iconType="feather"
          iconName="lock"
        />
        <CustomInput
          label={t('ChangePassword.confirmPassword')}
          placeholder={t('ChangePassword.confirmPasswordPlaceholder')}
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
        <CustomButton text={t('ChangePassword.changeNow')} type="PRIMARY" />
      </View>
    </View>
  );
};

export default ChangePassword;

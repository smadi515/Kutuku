import {View, Text, ScrollView} from 'react-native';
import React from 'react';
import Header from '../components/Header';
import {useTranslation} from 'react-i18next';

const LegalPolicies = () => {
  const {t, i18n} = useTranslation();
  const isRTL = i18n.language === 'ar';
  return (
    <View style={{flex: 1}}>
      <Header
        showImage={false}
        title={t('LegalPolicies.title')}
        showBack={true}
        rightIcons={[
          {
            name: 'info',
            type: 'AntDesign',
            onPress: () => {},
          },
        ]}
      />
      <ScrollView
        style={{margin: 5, padding: 5, direction: isRTL ? 'rtl' : 'ltr'}}>
        <Text style={{fontSize: 25, fontFamily: 'bold'}}>
          {t('LegalPolicies.terms_title')}
        </Text>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{color: 'gray'}}>{t('LegalPolicies.terms_text')}</Text>
        </View>

        <Text style={{fontSize: 25, fontFamily: 'bold', margin: 5}}>
          {t('LegalPolicies.changes_title')}
        </Text>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{color: 'gray'}}>{t('LegalPolicies.changes_text')}</Text>
        </View>

        <Text style={{fontSize: 25, fontFamily: 'bold', margin: 5}}>
          {t('LegalPolicies.refund_title')}
        </Text>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{color: 'gray'}}>{t('LegalPolicies.refund_text')}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default LegalPolicies;

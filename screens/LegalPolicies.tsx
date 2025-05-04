import {View, Text, ScrollView} from 'react-native';
import React from 'react';
import Header from '../components/Header';

const LegalPolicies = () => {
  return (
    <View
      style={{
        flex: 1,
      }}>
      <Header
        showImage={false}
        title="LegalPolicies"
        showBack={true}
        rightIcons={[
          {
            name: 'info',
            type: 'AntDesign',
            onPress: () => {},
          },
        ]}
      />
      <ScrollView style={{margin: 5, padding: 5}}>
        <Text style={{fontSize: 25, fontFamily: 'bold'}}>Terms</Text>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{color: 'gray'}}>
            By using [KUTUKU], you agree to the following terms: You must be at
            least 13 years old to use this app. You agree not to misuse the app
            (e.g., for fraud, spam, or illegal activity). Prices and product
            availability may change at any time. We are not responsible for
            delays or failures outside our control. Violation of these terms may
            result in account suspension or removal.
          </Text>
        </View>
        <Text style={{fontSize: 25, fontFamily: 'bold', margin: 5}}>
          Changes to the service and/or Terms
        </Text>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{color: 'gray'}}>
            Effective Date: April 29, 2025 Your privacy is important to us. This
            Privacy Policy explains how [Your App Name] collects, uses, and
            protects your information. What We Collect: Personal information
            (e.g., name, email, address) Usage data (e.g., app interactions,
            pages visited) Device information (e.g., mobile OS, device type) How
            We Use Your Data: To provide and improve our services To communicate
            with you about your orders or inquiries To enhance app performance
            and security Data Sharing: We do not sell or rent your personal
            data. We may share it with third-party services (like payment
            processors) only as needed to operate the app.
          </Text>
        </View>

        <Text style={{fontSize: 25, fontFamily: 'bold', margin: 5}}>
          Return & Refund Policy
        </Text>
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
          <Text style={{color: 'gray'}}>
            We want you to be happy with your purchase. If you're not satisfied,
            please review our return policy: Returns: You may request a return
            within 7 days of receiving the item. Items must be unused and in
            original condition. Refunds: Once we receive and inspect your
            return, we will process your refund within 3–7 business days.
            Non-Returnable Items: Sale items or used products are not eligible
            for return.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default LegalPolicies;

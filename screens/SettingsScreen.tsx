import React from 'react';
import {View, StyleSheet, ScrollView, Text} from 'react-native';
import Header from '../components/Header';
import CustomButton from '../components/CustomButton';

const SettingsScreen = ({navigation}: any) => {
  return (
    <ScrollView style={styles.container}>
      <Header
        showBack={true}
        showImage={false}
        title="Settings"
        rightIcons={[
          {
            name: 'info',
            type: 'AntDesign',
            onPress: () => {},
          },
        ]}
      />
      <View style={styles.content}>
        <Text>General</Text>
        <CustomButton
          text="Edit profile"
          onPress={() => {
            navigation.navigate('EditProfile');
          }}
          icon="user"
          iconType="AntDesign"
          type="ICON_ROW"
        />
        <CustomButton
          text="Change Password"
          onPress={() => navigation.navigate('ChangePassword')}
          icon="lock"
          iconType="AntDesign"
          type="ICON_ROW"
        />
        <CustomButton
          text="Notifications"
          onPress={() => {
            navigation.navigate('NotificationSetting');
          }}
          icon="notifications"
          iconType="Ionicons"
          type="ICON_ROW"
        />
        <CustomButton
          text="Security"
          onPress={() => navigation.navigate('SecurityScreen')}
          icon="security"
          iconType="MaterialCommunityIcons"
          type="ICON_ROW"
        />
        <CustomButton
          text="Language"
          onPress={() => navigation.navigate('LanguageScreen')}
          icon="language"
          iconType="MaterialIcons"
          type="ICON_ROW"
        />
        <Text>Preferencess</Text>
        <CustomButton
          text="Legal and Policies"
          onPress={() => {
            navigation.navigate('LegalPolicies');
          }}
          icon="sheriff-badge"
          iconType="Foundation"
          type="ICON_ROW"
        />
        <CustomButton
          text="Help & Support"
          onPress={() => navigation.navigate('HelpSupport')}
          icon="help-circle"
          iconType="Feather"
          type="ICON_ROW"
        />
        <CustomButton
          text="Logout"
          onPress={() => {
            navigation.navigate('Login');
          }}
          icon="logout"
          iconType="MaterialCommunityIcons"
          type="ICON_ROW"
        />

        {/* You can add more buttons as needed */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 5,
  },
});

export default SettingsScreen;

import React from 'react';
import {View, StyleSheet} from 'react-native';
import ToggleRowItem from '../components/ToggleRowItem';
import Header from '../components/Header';

const NotificationSetting = () => {
  return (
    <View style={styles.container}>
      <Header
        showBack={true}
        showImage={false}
        title="Notification"
        rightIcons={[
          {
            name: 'info',
            type: 'AntDesign',
            onPress: () => {},
          },
        ]}
      />
      <View style={styles.card}>
        <ToggleRowItem title="Payment" initialValue />
        <ToggleRowItem title="Traking" initialValue />
        <ToggleRowItem title="Complete Order" initialValue />
        <ToggleRowItem title="Notification" initialValue />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
  },
});

export default NotificationSetting;

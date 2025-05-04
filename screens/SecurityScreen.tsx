import React from 'react';
import {View, StyleSheet} from 'react-native';
import ToggleRowItem from '../components/ToggleRowItem';
import Header from '../components/Header';

const SecurityScreen = () => {
  return (
    <View style={styles.container}>
      <Header
        showBack={true}
        showImage={false}
        title="Security"
        rightIcons={[
          {
            name: 'info',
            type: 'AntDesign',
            onPress: () => {},
          },
        ]}
      />
      <View style={styles.card}>
        <ToggleRowItem title="Face ID" initialValue />
        <ToggleRowItem title="Remember Password" initialValue />
        <ToggleRowItem title="Touch ID" initialValue />
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

export default SecurityScreen;

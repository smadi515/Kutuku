import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import Header from '../components/Header';
import Icon from '../components/icon';

const notifications = [
  {
    id: '1',
    type: 'purchase',
    title: 'Purchase Completed!',
    message:
      'You have successfully purchased 334 headphones, thank you and wait for your package to arrive ✨',
    time: '2 m ago',
    icon: 'cart-outline',
    iconType: 'Ionicons',
  },
  {
    id: '2',
    type: 'message',
    title: 'Jerremy Send You a Message',
    message: 'hello your package has almost arrived, are you at home now?',
    time: '2 m ago',
    avatar: require('../assets/user.jpg'), // replace with actual image
    reply: 'Reply the message',
  },
  {
    id: '3',
    type: 'promo',
    title: 'Flash Sale!',
    message: 'Get 20% discount for first transaction in this month! 😍',
    time: '2 m ago',
    icon: 'gift',
    iconType: 'Feather',
  },
  {
    id: '4',
    type: 'sent',
    title: 'Package Sent',
    message: 'Hi your package has been sent from new york',
    time: '10 m ago',
    icon: 'truck',
    iconType: 'Feather',
  },
];

const NotificationScreen = () => {
  const renderItem = ({item}: any) => (
    <View style={styles.notificationCard}>
      {item.avatar ? (
        <Image source={item.avatar} style={styles.avatar} />
      ) : (
        <View style={styles.iconWrapper}>
          <Icon
            name={item.icon}
            type={item.iconType}
            size={20}
            color="#7D7D7D"
          />
        </View>
      )}

      <View style={{flex: 1}}>
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.message}>{item.message}</Text>
        {item.reply && (
          <TouchableOpacity>
            <Text style={styles.reply}>{item.reply}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={{flex: 1}}>
      <Header
        title="Notification"
        showBack={true}
        showImage={false}
        rightIcons={[
          {
            name: 'settings-outline',
            type: 'Ionicons',
            onPress: () => {}, // add navigation to settings if needed
          },
        ]}
      />
      <View>
        <Text style={styles.recent}>Recent</Text>

        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 20}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  recent: {
    fontSize: 16,
    fontWeight: 'bold',

    marginBottom: 8,
    paddingHorizontal: 16,
    color: '#1e1e1e',
  },
  notificationCard: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingRight: 8,
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontWeight: 'bold',
    color: '#1e1e1e',
    flex: 1,
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  message: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  reply: {
    marginTop: 6,
    color: '#007BFF',
    fontWeight: '600',
    fontSize: 13,
  },
});

export default NotificationScreen;

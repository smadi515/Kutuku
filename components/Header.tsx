// components/Header.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '../components/icon'; // Adjust path as needed
import type { RootStackParamList } from '../App';
import colors from '../utils/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type HeaderIcon = {
  name: string;
  type: string;
  onPress: () => void;
  color?: string;
  render?: () => React.ReactNode;
};

const HEIGHT = 80;

const Header = ({
  title,
  showBack = false,
  color,
  rightIcons = [],
  showImage = true,
}: {
  title?: string;
  showBack?: boolean;
  color?: string;
  rightIcons?: HeaderIcon[];
  showImage?: boolean;
}) => {
  const navigation = useNavigation<NavigationProp>();

  const renderTitle = () => (
    <View
      style={[
        styles.container,
        { position: 'absolute', top: 0, width: '100%', zIndex: 10 },
      ]}>
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon type="Ionicons" name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 24 }} />
      )}

      <Text
        style={[
          styles.title,
          !!color && { color },
          { fontFamily: 'regular', flex: 1, textAlign: 'center' },
        ]}>
        {title}
      </Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {rightIcons.map((icon, index) => (
          <TouchableOpacity
            key={index}
            onPress={icon.onPress}
            style={{ marginLeft: 8 }}>
            {icon.render ? icon.render() : (
              <Icon
                type={icon.type}
                name={icon.name}
                size={24}
                color={icon.color ?? color ?? colors.text.primary}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View
      style={{
        height: HEIGHT,
        width: '100%',
        position: showImage ? 'relative' : 'relative', // ← changed from 'absolute'
      }}>
      <StatusBar translucent backgroundColor="transparent" />
      {showImage ? (
        <ImageBackground
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            zIndex: 0,
          }}
          source={require('../assets/onBoarding1.jpg')}>
          {renderTitle()}
        </ImageBackground>
      ) : (
        renderTitle()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
});

Header.height = HEIGHT;
export default Header;

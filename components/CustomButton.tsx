import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from './icon'; // your custom icon.js
type ButtonType = 'PRIMARY' | 'ICON_ROW' | 'TERTIARY';

type Props = {
  text?: String;
  onPress?: () => void;
  type?: ButtonType;
  icon?: String;
  iconType?: String;
  iconColor?: 'white';
  iconSize?: 20;
  showRightArrow?: boolean;
};
const CustomButton: React.FC<Props> = ({
  text,
  onPress,
  type = 'PRIMARY',
  icon,
  iconType,
  iconColor,
  iconSize,
  showRightArrow,
}) => {
  const isIconRow = type === 'ICON_ROW';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, type && styles[`container_${type}`]]}>
      <View style={[styles.content, isIconRow && styles.content_iconRow]}>
        {icon && (
          <Icon
            name={icon}
            type={iconType}
            color={isIconRow ? 'black' : iconColor}
            size={iconSize}
            style={[styles.icon, isIconRow && styles.iconLeft]}
          />
        )}
        <Text style={[styles.text, styles[`text_${type}`]]}>{text}</Text>

        {isIconRow && showRightArrow !== false && (
          <Icon
            name="arrow-right"
            type="feather"
            color="gray"
            size={20}
            style={styles.iconRight}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  container_TERTIARY: {
    borderColor: 'purple',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  container_PRIMARY: {
    fontWeight: 'bold',
    borderRadius: 40,
    width: '70%',
    backgroundColor: 'purple',
  },
  container_ICON_ROW: {
    backgroundColor: '#e0e0e0', // gray background
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    width: '90%',
    alignSelf: 'center',
  },
  text: {
    color: 'black',
    fontSize: 16,
  },
  text_PRIMARY: {
    color: 'white',
  },
  text_TERTIARY: {
    color: 'purple',
    textDecorationLine: 'underline',
  },
  text_ICON_ROW: {
    flex: 1,
    color: 'black',
    fontSize: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content_iconRow: {
    justifyContent: 'space-between',
  },
  icon: {
    marginRight: 8,
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
});

export default CustomButton;

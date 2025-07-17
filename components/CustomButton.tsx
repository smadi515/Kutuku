import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import Icon from './icon'; // your custom icon.js

type ButtonType = 'PRIMARY' | 'ICON_ROW' | 'TERTIARY';

type Props = {
  text?: string;
  onPress?: () => void;
  type?: ButtonType;
  icon?: string;
  iconType?: string;
  iconColor?: 'white';
  iconSize?: number;
  showRightArrow?: boolean;
  disabled?: boolean;
  loading?: boolean;
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
  disabled = false,
  loading = false,
  // Optional color prop for future use
}) => {
  const isIconRow = type === 'ICON_ROW';
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={!isDisabled ? onPress : undefined}
      style={[
        styles.container,
        type && styles[`container_${type}`],
        isDisabled && styles.disabled,
      ]}
      disabled={isDisabled}>
      <View style={[styles.content, isIconRow && styles.content_iconRow]}>
        {loading ? (
          <ActivityIndicator color={type === 'PRIMARY' ? '#fff' : 'gray'} />
        ) : (
          <>
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
          </>
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
    borderColor: '#7B2FF2',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  container_PRIMARY: {
    fontWeight: 'bold',
    borderRadius: 40,
    width: '70%',
    backgroundColor: '#7B2FF2',
  },
  container_ICON_ROW: {
    backgroundColor: '#e0e0e0',
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
    color: '#7B2FF2',
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
  disabled: {
    opacity: 0.5,
  },
});

export default CustomButton;

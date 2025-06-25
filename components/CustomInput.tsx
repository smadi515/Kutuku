import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from './icon'; // adjust the import path as needed

interface CustomInputProps {
  label?: string;
  placeholder?: string;
  iconType?: string;
  iconName?: string;
  rightIconType?: string;
  rightIconName?: string;
  secureTextEntry?: boolean;
  onChangeText?: (text: string) => void;
  onRightIconPress?: () => void;
  value?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  iconType,
  iconName,
  rightIconType,
  rightIconName,
  secureTextEntry,
  onChangeText,
  onRightIconPress,
  value,
  keyboardType,
}) => {
  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {iconName && (
          <Icon type={iconType} name={iconName} size={20} color="#888" />
        )}
        <TextInput
          value={value}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          style={styles.input}
          placeholderTextColor="#aaa"
        />
        {rightIconName && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Icon
              type={rightIconType}
              name={rightIconName}
              size={18}
              color="#888"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  inputContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  input: {
    marginLeft: 10,
    flex: 1,
    color: '#000',
  },
});

export default CustomInput;

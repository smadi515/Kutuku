import React from 'react';
import {View, TextInput, StyleSheet, Text} from 'react-native';
import Icon from './icon'; // adjust if path is different

interface CustomInputProps {
  label?: string;
  placeholder?: string;
  iconType?: string;
  iconName?: string;
  secureTextEntry?: boolean;
  onChangeText?: (text: string) => void;
  value?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'; // or just `string`
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  placeholder,
  iconType,
  iconName,
  secureTextEntry,
  onChangeText,
  value,
  keyboardType,
}) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Icon type={iconType} name={iconName} size={20} color="#888" />
        <TextInput
          value={value}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          style={styles.input}
          placeholderTextColor="#aaa"
        />
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

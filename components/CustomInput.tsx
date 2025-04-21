import React from 'react';
import {View, TextInput, StyleSheet, Text} from 'react-native';
import Icon from './icon'; // adjust if path is different

const CustomInput = ({
  label,
  placeholder,
  iconType,
  iconName,
  secureTextEntry,
  onChangeText,
}: any) => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <Icon type={iconType} name={iconName} size={20} color="#888" />
        <TextInput
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          onChangeText={onChangeText}
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

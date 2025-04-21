import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';

const CustomButton = ({text, onPress, type = 'PRIMARY'}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, styles[`container_${type}`]]}>
      <Text style={[styles.text, styles[`text_${type}`]]}>{text}</Text>
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
  container_PRIMARY: {
    fontWeight: 'bold',
    borderRadius: 40,
    width: '70%',
    backgroundColor: 'purple',
    container_tERTIARY: {},
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
});
export default CustomButton;

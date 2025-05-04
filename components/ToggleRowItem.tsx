import React, {useState} from 'react';
import {View, Text, StyleSheet, Switch} from 'react-native';

interface ToggleRowItemProps {
  title: string;
  initialValue?: boolean;
  onToggle?: (value: boolean) => void;
}

const ToggleRowItem: React.FC<ToggleRowItemProps> = ({
  title,
  initialValue = false,
  onToggle,
}) => {
  const [isEnabled, setIsEnabled] = useState(initialValue);

  const toggleSwitch = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    if (onToggle) onToggle(newValue);
  };

  return (
    <View style={styles.row}>
      <Text style={styles.text}>{title}</Text>
      <Switch
        value={isEnabled}
        onValueChange={toggleSwitch}
        thumbColor="#fff"
        trackColor={{false: '#ccc', true: 'purple'}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default ToggleRowItem;

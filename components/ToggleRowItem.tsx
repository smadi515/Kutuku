import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import colors from '../utils/colors';

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
        trackColor={{ false: colors.gray[400], true: colors.primary.main }}
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
    borderBottomColor: colors.border.light,
    borderBottomWidth: 1,
    backgroundColor: colors.background.secondary,
  },
  text: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});

export default ToggleRowItem;

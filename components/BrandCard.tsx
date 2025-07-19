// components/BrandCard.tsx
import React from 'react';
import { Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../utils/colors';

type BrandCardProps = {
  id: number;
  name: string;
  image: string;
  onPress: (id: number) => void;
};

const BrandCard: React.FC<BrandCardProps> = ({ id, name, image, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(id)} style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.name}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.card.background,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: colors.gray[200],
  },
  name: {
    padding: 10,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});

export default BrandCard;

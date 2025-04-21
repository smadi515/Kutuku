// screens/CategoryTab.tsx
import React from 'react';
import {View, Text, Image, ScrollView, StyleSheet} from 'react-native';

const categories = [
  {
    id: 1,
    title: 'Men Fashion',
    image: require('../assets/Maskgroup1.png'),
  },
  {
    id: 2,
    title: 'Women Fashion',
    image: require('../assets/Maskgroup1.png'),
  },
  {
    id: 3,
    title: 'Shoes & Accessories',
    image: require('../assets/Maskgroup1.png'),
  },
  // Add more if needed
];

const CategoryTab = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {categories.map(category => (
        <View key={category.id} style={styles.card}>
          <Image
            source={category.image}
            style={styles.image}
            resizeMode="cover"
          />
          <Text style={styles.title}>{category.title}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  card: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
  },
  title: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default CategoryTab;

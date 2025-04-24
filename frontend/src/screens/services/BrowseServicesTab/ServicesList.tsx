import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import ServiceCard from './ServiceCard';

const mockServices = [
  { id: '1', type: 'Walking', provider: 'Jane Doe', cost: 5, description: 'Dog walking in the neighborhood.' },
  { id: '2', type: 'Boarding', provider: 'John Smith', cost: 20, description: 'Overnight pet boarding.' },
];

export default function ServicesList() {
  return (
    <FlatList
      data={mockServices}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ServiceCard service={item} />}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 8 },
});

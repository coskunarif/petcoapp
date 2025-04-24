import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import ListingCard from './ListingCard';

const mockListings = [
  { id: '1', type: 'Walking', status: 'Active', description: 'Dog walking daily.' },
  { id: '2', type: 'Boarding', status: 'Paused', description: 'Boarding for small dogs.' },
];

export default function ActiveListingsSection() {
  return (
    <FlatList
      data={mockListings}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ListingCard listing={item} />}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 8 },
});

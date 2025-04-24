import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import RequestCard from './RequestCard';

const mockRequests = [
  { id: '1', type: 'Walking', status: 'Pending', requester: 'Alice', provider: 'Bob', date: '2025-04-25' },
  { id: '2', type: 'Boarding', status: 'Accepted', requester: 'Carol', provider: 'Dave', date: '2025-04-26' },
];

export default function RequestsList() {
  return (
    <FlatList
      data={mockRequests}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <RequestCard request={item} />}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 8 },
});

import React from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import ListingCard from './ListingCard';
import { useQuery } from '@tanstack/react-query';
import { fetchServices } from '../../../api/services';
import { useSelector } from 'react-redux';

export default function ActiveListingsSection() {
  // Assume userId is available from Redux auth slice
  const userId = useSelector((state: any) => state.auth?.user?.id);
  const { data, isLoading, error } = useQuery(['myListings', userId], () => fetchServices({ provider_id: userId }).then(res => res.data), { enabled: !!userId });

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }
  if (error) {
    return <Text style={{ color: 'red', margin: 16 }}>Failed to load your listings.</Text>;
  }
  if (!data || data.length === 0) {
    return <Text style={{ margin: 16 }}>You have no active service listings.</Text>;
  }
  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ListingCard listing={item} />}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 8 },
});

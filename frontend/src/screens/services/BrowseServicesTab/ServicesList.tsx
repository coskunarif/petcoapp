import React from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import ServiceCard from './ServiceCard';
import { useQuery } from '@tanstack/react-query';
import { fetchServices } from '../../../api/services';

export default function ServicesList() {
  // Debug: Trace render
  console.log('[ServicesList] render');
  const { data, isLoading, error } = useQuery({
  queryKey: ['services'],
  queryFn: () => fetchServices().then(res => res.data),
});
  // Debug: Log query state
  console.log('[ServicesList] isLoading:', isLoading, 'error:', error, 'data:', data);

  if (isLoading) {
    console.log('[ServicesList] Loading...');
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }
  if (error) {
    console.log('[ServicesList] Error:', error);
    return <Text style={{ color: 'red', margin: 16 }}>Failed to load services.</Text>;
  }
  if (!data || data.length === 0) {
    console.log('[ServicesList] No data found:', data);
    return <Text style={{ margin: 16 }}>No services found.</Text>;
  }
  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ServiceCard service={item} />}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 8 },
});

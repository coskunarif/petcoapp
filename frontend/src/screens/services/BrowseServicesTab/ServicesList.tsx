import React from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import ServiceCard from './ServiceCard';
import { useQuery } from '@tanstack/react-query';
import { fetchServices } from '../../../api/services';

export default function ServicesList() {
  const { data, isLoading, error } = useQuery(['services'], () => fetchServices().then(res => res.data));

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }
  if (error) {
    return <Text style={{ color: 'red', margin: 16 }}>Failed to load services.</Text>;
  }
  if (!data || data.length === 0) {
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

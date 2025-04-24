import React from 'react';
import { FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import RequestCard from './RequestCard';
import { useQuery } from '@tanstack/react-query';
import { fetchRequests } from '../../../api/requests';
import { useSelector } from 'react-redux';

export default function RequestsList() {
  const userId = useSelector((state: any) => state.auth?.user?.id);
  const asProvider = useSelector((state: any) => state.services?.requestsTabAsProvider) ?? true;
  const { data, isLoading, error } = useQuery(['requests', userId, asProvider], () => fetchRequests({ asProvider, userId }).then(res => res.data), { enabled: !!userId });

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }
  if (error) {
    return <Text style={{ color: 'red', margin: 16 }}>Failed to load requests.</Text>;
  }
  if (!data || data.length === 0) {
    return <Text style={{ margin: 16 }}>No requests found.</Text>;
  }
  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <RequestCard request={item} />}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 8 },
});

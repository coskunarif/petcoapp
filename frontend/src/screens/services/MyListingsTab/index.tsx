import React from 'react';
import { View } from 'react-native';
import ActiveListingsSection from './ActiveListingsSection';
import EmptyListingsState from './EmptyListingsState';

export default function MyListingsTab() {
  // Placeholder logic for whether user has listings
  const hasListings = true;
  return (
    <View style={{ flex: 1 }}>
      {hasListings ? <ActiveListingsSection /> : <EmptyListingsState />}
    </View>
  );
}

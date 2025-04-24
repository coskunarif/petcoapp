import React from 'react';
import { View, Text } from 'react-native';
import ServiceFilterBar from './ServiceFilterBar';
import ServicesList from './ServicesList';

export default function BrowseServicesTab() {
  return (
    <View style={{ flex: 1 }}>
      <ServiceFilterBar />
      <ServicesList />
    </View>
  );
}

import React from 'react';
import { View } from 'react-native';
import RequestsFilterToggle from './RequestsFilterToggle';
import RequestsList from './RequestsList';

export default function RequestsTab() {
  return (
    <View style={{ flex: 1 }}>
      <RequestsFilterToggle />
      <RequestsList />
    </View>
  );
}

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Searchbar, Button } from 'react-native-paper';

export default function ServiceFilterBar() {
  // Placeholder for filter/search logic
  return (
    <View style={styles.container}>
      <Searchbar placeholder="Search services" style={styles.searchbar} />
      <Button mode="outlined" style={styles.filterButton}>Filter</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  searchbar: { flex: 1, marginRight: 8 },
  filterButton: { height: 40 },
});

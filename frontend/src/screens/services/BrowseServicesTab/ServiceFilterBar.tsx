import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Searchbar, Button } from 'react-native-paper';

export default function ServiceFilterBar() {
  const [searchValue, setSearchValue] = useState('');
  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search services"
        style={styles.searchbar}
        value={searchValue}
        onChangeText={setSearchValue}
      />
      <Button mode="outlined" style={styles.filterButton}>Filter</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  searchbar: { flex: 1, marginRight: 8 },
  filterButton: { height: 40 },
});

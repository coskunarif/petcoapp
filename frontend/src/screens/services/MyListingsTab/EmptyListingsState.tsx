import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../../../components/Button';

export default function EmptyListingsState() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>You have no active service listings.</Text>
      <Button title="Create a Listing" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  text: { fontSize: 16, marginBottom: 16 },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function RequestsFilterToggle() {
  // Placeholder for toggle logic
  return (
    <View style={styles.container}>
      <Button mode="outlined" style={styles.button}>As Provider</Button>
      <Button mode="outlined" style={styles.button}>As Requester</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', padding: 8 },
  button: { marginHorizontal: 4 },
});

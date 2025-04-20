import React from 'react';
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native';

interface AddPetFABProps {
  onPress: () => void;
}

const AddPetFAB: React.FC<AddPetFABProps> = ({ onPress }) => (
  <TouchableOpacity style={styles.fab} onPress={onPress} accessibilityLabel="Add Pet">
    <Text style={styles.plus}>+</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  plus: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -2,
  },
});

export default AddPetFAB;

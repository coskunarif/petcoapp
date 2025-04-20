import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onCreateRequestPress: () => void;
  onOfferServicePress: () => void;
}

const QuickActionsSection: React.FC<Props> = ({ onCreateRequestPress, onOfferServicePress }) => (
  <View style={styles.container}>
    <TouchableOpacity style={styles.actionBtn} onPress={onCreateRequestPress}>
      <Ionicons name="paw" size={24} color="#fff" />
      <Text style={styles.label}>Request Service</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.actionBtn} onPress={onOfferServicePress}>
      <Ionicons name="add-circle" size={24} color="#fff" />
      <Text style={styles.label}>Offer Service</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
  },
  actionBtn: {
    backgroundColor: '#4F8EF7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 8,
  },
});

export default QuickActionsSection;

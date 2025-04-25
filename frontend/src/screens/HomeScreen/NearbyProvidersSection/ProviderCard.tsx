import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  provider: any;
  onPress: () => void;
}

const ProviderCard: React.FC<Props> = ({ provider, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Image source={{ uri: provider.profile_image_url }} style={styles.avatar} />
    <View style={styles.info}>
      <Text style={styles.name}>{provider.name}</Text>
      <Text style={styles.distance}>{provider.distance.toFixed(1)} km away</Text>
      <Text style={styles.rating}>⭐ {provider.rating.toFixed(1)}</Text>
      <Text style={styles.services}>{provider.serviceTypes?.join(', ')}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)', // glassy
    borderRadius: 20,
    margin: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: '#E6E6FA',
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: '900',
    fontSize: 18,
    marginBottom: 2,
    color: '#23235B',
  },
  distance: {
    fontSize: 14,
    color: '#6C63FF',
    fontWeight: '600',
    marginBottom: 2,
  },
  rating: {
    fontSize: 15,
    color: '#FFD700', // modern gold accent
    fontWeight: 'bold',
    marginBottom: 2,
  },
  services: {
    fontSize: 12,
    color: '#4F8EF7',
  },
});

export default ProviderCard;

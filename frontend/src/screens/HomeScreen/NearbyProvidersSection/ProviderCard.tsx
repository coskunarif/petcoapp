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
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 26, // More refined
    marginVertical: 14,
    marginHorizontal: 18,
    paddingVertical: 22,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#1A244066', // Modern subtle shadow
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
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

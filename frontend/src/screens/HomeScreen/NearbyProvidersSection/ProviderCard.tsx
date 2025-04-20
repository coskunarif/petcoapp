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
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  distance: {
    fontSize: 13,
    color: '#888',
  },
  rating: {
    fontSize: 13,
    color: '#FFA726',
  },
  services: {
    fontSize: 12,
    color: '#4F8EF7',
  },
});

export default ProviderCard;

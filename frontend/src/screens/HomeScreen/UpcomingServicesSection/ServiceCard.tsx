import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  service: any;
  onPress: () => void;
}

const ServiceCard: React.FC<Props> = ({ service, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.row}>
      <Image source={{ uri: service.pets?.image_url }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{service.pets?.name}</Text>
        <Text style={styles.time}>{service.start_time}</Text>
        <Text style={[styles.status, { color: getStatusColor(service.status) }]}>{service.status}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return '#FFB300';
    case 'accepted': return '#4CAF50';
    case 'completed': return '#2196F3';
    default: return '#757575';
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    padding: 12,
    elevation: 2,
    width: 220,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  time: {
    fontSize: 13,
    color: '#888',
  },
  status: {
    marginTop: 4,
    fontWeight: '600',
  },
});

export default ServiceCard;

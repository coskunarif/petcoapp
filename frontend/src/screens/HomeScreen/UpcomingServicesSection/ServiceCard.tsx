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
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 26,
    marginVertical: 14,
    marginHorizontal: 12,
    paddingVertical: 22,
    paddingHorizontal: 22,
    elevation: 10,
    width: 250,
    shadowColor: '#1A244066',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.13,
    shadowRadius: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  time: {
    fontSize: 16,
    color: '#6C63FF',
    fontWeight: '600',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    marginTop: 6,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    textTransform: 'capitalize',
  },
});

export default ServiceCard;

import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ServiceCard from './ServiceCard';

interface Props {
  services: { asProvider: any[]; asRequester: any[] };
  onServicePress: (service: any) => void;
}

const UpcomingServicesSection: React.FC<Props> = ({ services, onServicePress }) => {
  const allServices = [...(services.asProvider || []), ...(services.asRequester || [])];
  if (allServices.length === 0) {
    return <Text style={styles.empty}>No upcoming services</Text>;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Services</Text>
      <FlatList
        horizontal
        data={allServices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ServiceCard service={item} onPress={() => onServicePress(item)} />
        )}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginLeft: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
    marginLeft: 8,
  },
  empty: {
    color: '#888',
    margin: 16,
    fontSize: 15,
    textAlign: 'center',
  },
});

export default UpcomingServicesSection;

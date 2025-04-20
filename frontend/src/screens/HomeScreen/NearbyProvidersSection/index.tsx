import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import ProviderCard from './ProviderCard';

interface Props {
  providers: any[];
  onProviderPress: (provider: any) => void;
}

const NearbyProvidersSection: React.FC<Props> = ({ providers, onProviderPress }) => {
  if (!providers?.length) {
    return <Text style={styles.empty}>No providers nearby</Text>;
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Providers</Text>
      <FlatList
        data={providers}
        keyExtractor={item => item.userId}
        renderItem={({ item }) => (
          <ProviderCard provider={item} onPress={() => onProviderPress(item)} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 8,
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

export default NearbyProvidersSection;

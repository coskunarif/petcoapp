import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Pet } from '../store/petsSlice';

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (pet: Pet) => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete }) => {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: pet.photos && pet.photos[0] ? pet.photos[0] : 'https://placekitten.com/80/80' }}
        style={styles.image}
        accessibilityLabel={pet.name}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{pet.name || 'Unnamed Pet'}</Text>
        <Text style={styles.breed}>{pet.breed || 'Breed unknown'}</Text>
        <Text style={styles.species}>{pet.species || 'Species'}{pet.age !== undefined && pet.age !== null ? ` • ${pet.age} yrs` : ''}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity accessibilityLabel={`Edit ${pet.name}`} onPress={() => onEdit && onEdit(pet)}>
          <Text style={styles.edit}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityLabel={`Delete ${pet.name}`} onPress={() => onDelete && onDelete(pet)}>
          <Text style={styles.delete}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: '#eee',
  },
  name: {
    fontWeight: '600',
    fontSize: 18,
    color: '#222',
  },
  breed: {
    color: '#666',
  },
  species: {
    color: '#999',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  edit: {
    color: '#1976d2',
    fontSize: 18,
    marginRight: 8,
  },
  delete: {
    color: '#d32f2f',
    fontSize: 18,
  },
});

export default PetCard;

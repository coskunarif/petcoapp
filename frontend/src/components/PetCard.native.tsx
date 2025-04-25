import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Pet } from '../store/petsSlice';

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (pet: Pet) => void;
}

import { Pressable } from 'react-native';
const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete }) => {
  const [pressed, setPressed] = React.useState(false);
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onEdit && onEdit(pet)}
      accessibilityLabel={`View details for ${pet.name}`}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: pet.photos && pet.photos[0] ? pet.photos[0] : 'https://placekitten.com/120/120' }}
          style={styles.image}
          accessibilityLabel={pet.name}
        />
      </View>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={styles.name}>{pet.name || 'Unnamed Pet'}</Text>
        <Text style={styles.breed}>{pet.breed || 'Breed unknown'}</Text>
        <Text style={styles.species}>{pet.species || 'Species'}{pet.age !== undefined && pet.age !== null ? ` • ${pet.age} yrs` : ''}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          accessibilityLabel={`Edit ${pet.name}`}
          style={styles.iconBtn}
          onPress={e => { e.stopPropagation && e.stopPropagation(); onEdit && onEdit(pet); }}
        >
          <Text style={styles.edit}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel={`Delete ${pet.name}`}
          style={styles.iconBtn}
          onPress={e => { e.stopPropagation && e.stopPropagation(); onDelete && onDelete(pet); }}
        >
          <Text style={styles.delete}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 22,
    marginBottom: 22,
    backgroundColor: 'rgba(255,255,255,0.80)', // glassy
    shadowColor: '#4a90e2',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 0,
    overflow: 'hidden',
    // For glassmorphism, add border if desired
    borderColor: 'rgba(74,144,226,0.18)',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.2,
  },
  imageWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#e0e7ff',
    marginRight: 20,
    width: 64,
    height: 64,
    backgroundColor: '#f1f5fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#eee',
  },
  name: {
    fontWeight: '700',
    fontSize: 20,
    color: '#232a35',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  breed: {
    fontWeight: '500',
    fontSize: 15,
    color: '#6a7ba2',
    marginBottom: 1,
  },
  species: {
    fontWeight: '400',
    fontSize: 14,
    color: '#a2adc0',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  iconBtn: {
    marginHorizontal: 4,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(74,144,226,0.10)',
  },
  edit: {
    fontSize: 22,
    color: '#1976d2',
  },
  delete: {
    fontSize: 22,
    color: '#e53935',
    marginLeft: 2,
  },
});

export default PetCard;

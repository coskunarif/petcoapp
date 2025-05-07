import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Pet } from '../store/petsSlice';
import { AppCard } from './ui';
import { theme } from '../theme';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (pet: Pet) => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete }) => {
  try {
    return (
      <TouchableOpacity
        onPress={() => onEdit && onEdit(pet)}
        activeOpacity={0.7}
        accessibilityLabel={`View details for ${pet.name}`}
      >
        <AppCard>
          <View style={styles.petCardContent}>
            <Image
              source={{ uri: pet.photos && pet.photos[0] ? pet.photos[0] : 'https://via.placeholder.com/100' }}
              style={styles.petImage}
              accessibilityLabel={pet.name}
            />
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{pet.name || 'Unnamed Pet'}</Text>
              <Text style={styles.petBreed}>{pet.species || 'Unknown'} • {pet.breed || 'Mixed'}</Text>
              <Text style={styles.petDetails}>
                {pet.age ? `${pet.age} years • ` : ''}
                {pet.weight ? `${pet.weight} kg` : ''}
              </Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={(e) => { e.stopPropagation(); onEdit && onEdit(pet); }}
                accessibilityLabel={`Edit ${pet.name}`}
              >
                <MaterialCommunityIcons name="pencil" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={(e) => { e.stopPropagation(); onDelete && onDelete(pet); }}
                accessibilityLabel={`Delete ${pet.name}`}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color={theme.colors.textTertiary}
            />
          </View>
        </AppCard>
      </TouchableOpacity>
    );
  } catch (error) {
    console.error('[PetCard] Error rendering pet card:', error);
    return <View><Text>Error displaying pet</Text></View>;
  }
};

const styles = StyleSheet.create({
  petCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    backgroundColor: theme.colors.primaryLight,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    ...theme.typography.h3,
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  petDetails: {
    fontSize: 14,
    color: theme.colors.textTertiary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
});

export default PetCard;

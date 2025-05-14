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
            {/* Left section: Image and Info */}
            <View style={styles.leftSection}>
              <Image
                source={{ 
                  uri: pet.image_url || (pet.photos && pet.photos[0]) 
                    ? pet.image_url || pet.photos[0] 
                    : 'https://via.placeholder.com/100' 
                }}
                style={styles.petImage}
                accessibilityLabel={pet.name}
              />
              <View style={styles.petInfo}>
                <Text style={styles.petName} numberOfLines={1} ellipsizeMode="tail">
                  {pet.name || 'Unnamed Pet'}
                </Text>
                <Text style={styles.petBreed} numberOfLines={1} ellipsizeMode="tail">
                  {pet.species || 'Unknown'} • {pet.breed || 'Mixed'}
                </Text>
                <Text style={styles.petDetails} numberOfLines={1} ellipsizeMode="tail">
                  {pet.age ? `${pet.age} years • ` : ''}
                  {pet.weight ? `${pet.weight} kg` : ''}
                </Text>
              </View>
            </View>
            
            {/* Right section: Just the chevron */}
            <View style={styles.rightSection}>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={theme.colors.textTertiary}
                style={styles.chevron}
              />
            </View>
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
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    overflow: 'hidden', // Ensure content doesn't overflow
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // Don't allow right section to shrink
    paddingLeft: 8,
  },
  petImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: theme.colors.primaryLight,
    flexShrink: 0, // Don't allow the image to shrink
  },
  petInfo: {
    flex: 1,
    overflow: 'hidden', // Prevent content from overflowing
  },
  petName: {
    ...theme.typography.h3,
    marginBottom: 4,
    fontSize: 16,
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
  chevron: {
    flexShrink: 0,
    opacity: 0.6,
  },
});

export default PetCard;

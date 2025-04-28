import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Pressable } from 'react-native';
import { Pet } from '../store/petsSlice';

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (pet: Pet) => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const elevation = useRef(new Animated.Value(7)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1.025, useNativeDriver: false }),
      Animated.timing(elevation, { toValue: 14, duration: 120, useNativeDriver: false })
    ]).start();
  };
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
      Animated.timing(elevation, { toValue: 7, duration: 120, useNativeDriver: false })
    ]).start();
  };

  return (
    <Pressable
      onPress={() => onEdit && onEdit(pet)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ borderRadius: 24 }}
      accessibilityLabel={`View details for ${pet.name}`}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale }],
            elevation: elevation,
            shadowRadius: elevation.interpolate({ inputRange: [7, 14], outputRange: [14, 24] }),
          }
        ]}
      >
        <View style={styles.accentBorder}>
          <View style={styles.innerContent}>
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
              <Pressable
                accessibilityLabel={`Edit ${pet.name}`}
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && { backgroundColor: '#e3edfc', transform: [{ scale: 0.93 }], opacity: 0.8 },
                ]}
                onPress={e => { e.stopPropagation && e.stopPropagation(); onEdit && onEdit(pet); }}
              >
                <Text style={styles.edit}>✏️</Text>
              </Pressable>
              <Pressable
                accessibilityLabel={`Delete ${pet.name}`}
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && { backgroundColor: '#fde5e3', transform: [{ scale: 0.93 }], opacity: 0.8 },
                ]}
                onPress={e => { e.stopPropagation && e.stopPropagation(); onDelete && onDelete(pet); }}
              >
                <Text style={styles.delete}>🗑️</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 18,
    borderRadius: 24,
    shadowColor: '#1A244099',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.17,
    shadowRadius: 24,
    elevation: 7,
    backgroundColor: 'transparent',
  },
  accentBorder: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(44, 62, 80, 0.08)',
    overflow: 'hidden',
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(255,255,255,0.97)',
  },
  imageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#E6E6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f3f7fd',
    shadowColor: '#1976d2',
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 3,
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

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme, globalStyles } from '../../theme';

// Mock data for pets
const mockPets = [
  {
    id: '1',
    name: 'Max',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: '3 years',
    imageUrl: null,
    color: '#66BB6A', // Green
    gradient: ['#66BB6A40', '#66BB6A10'],
    icon: 'dog',
  },
  {
    id: '2',
    name: 'Bella',
    species: 'Dog',
    breed: 'Labrador',
    age: '1 year',
    imageUrl: null,
    color: '#42A5F5', // Blue
    gradient: ['#42A5F540', '#42A5F510'],
    icon: 'dog',
  },
  {
    id: '3',
    name: 'Mittens',
    species: 'Cat',
    breed: 'Domestic Shorthair',
    age: '4 years',
    imageUrl: null,
    color: '#FFA726', // Orange
    gradient: ['#FFA72640', '#FFA72610'],
    icon: 'cat',
  },
  {
    id: '4',
    name: 'Rocky',
    species: 'Dog',
    breed: 'German Shepherd',
    age: '5 years',
    imageUrl: null,
    color: '#9C27B0', // Purple
    gradient: ['#9C27B040', '#9C27B010'],
    icon: 'dog',
  },
];

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  imageUrl: string | null;
  color: string;
  gradient: string[];
  icon: string;
}

interface PetListProps {
  onPetPress: (pet: Pet) => void;
  onAddPetPress: () => void;
}

const PetList: React.FC<PetListProps> = ({ onPetPress, onAddPetPress }) => {
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth * 0.44; // Approximately 44% of screen width

  // If there are no pets, show empty state
  if (mockPets.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons 
          name="dog" 
          size={60} 
          color={theme.colors.primary} 
        />
        <Text style={styles.emptyTitle}>No pets added yet</Text>
        <Text style={styles.emptySubtitle}>
          Add your pets to manage their care and request services
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPetPress}
        >
          <Text style={styles.addButtonText}>Add a Pet</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Add Pet card to add at end of list
  const renderAddPetCard = () => (
    <TouchableOpacity
      style={[styles.addPetCard, { width: cardWidth }]}
      onPress={onAddPetPress}
    >
      <LinearGradient
        colors={['rgba(108,99,255,0.15)', 'rgba(108,99,255,0.05)']}
        style={styles.addPetCardGradient}
      >
        <View style={styles.addPetIconContainer}>
          <MaterialCommunityIcons
            name="plus"
            size={32}
            color={theme.colors.primary}
          />
        </View>
        <Text style={styles.addPetText}>Add Pet</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Render each pet card
  const renderPetCard = ({ item }: { item: Pet }) => (
    <TouchableOpacity
      style={[styles.petCard, { width: cardWidth }]}
      onPress={() => onPetPress(item)}
    >
      <LinearGradient
        colors={item.gradient}
        style={styles.petCardGradient}
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.petImage}
          />
        ) : (
          <View 
            style={[
              styles.petImagePlaceholder,
              { backgroundColor: `${item.color}30` }
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon as any}
              size={40}
              color={item.color}
            />
          </View>
        )}
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petBreed}>{item.breed}</Text>
        <Text style={styles.petAge}>{item.age}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Data including pets and add pet card
  const listData = [...mockPets, { id: 'add', name: 'Add Pet', species: '', breed: '', age: '', imageUrl: null, color: '', gradient: [], icon: 'plus' }];

  return (
    <FlatList
      data={listData}
      renderItem={({ item }) => (
        item.id === 'add' ? renderAddPetCard() : renderPetCard({ item })
      )}
      keyExtractor={item => item.id}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: theme.spacing.sm,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  petCard: {
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    ...theme.elevation.small,
    marginBottom: theme.spacing.md,
  },
  petCardGradient: {
    padding: theme.spacing.md,
    alignItems: 'center',
    height: 180,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.sm,
  },
  petImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  petName: {
    ...theme.typography.h3,
    marginTop: theme.spacing.xs,
  },
  petBreed: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  petAge: {
    ...theme.typography.caption,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  addPetCard: {
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    ...theme.elevation.small,
    marginBottom: theme.spacing.md,
  },
  addPetCardGradient: {
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  addPetIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(108,99,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  addPetText: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h2,
    marginTop: theme.spacing.md,
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    ...theme.elevation.small,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '700',
  },
});

export default PetList;
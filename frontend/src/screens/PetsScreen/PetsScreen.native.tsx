import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchPetsAsync, setEditingPet } from '../../store/petsSlice';
import PetsList from './PetsList.native';
import EmptyStatePets from './EmptyStatePets.native';
import AddPetFAB from './AddPetFAB.native';
import PetDetailModal from './PetDetailModal.native';

const PetsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { petsList, loading, error, editingPet } = useSelector((state: RootState) => state.pets);
  console.log('[PetsScreen] useSelector petsList:', petsList, 'loading:', loading, 'error:', error, 'editingPet:', editingPet);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  console.log('[PetsScreen] useSelector userId:', userId);

  useEffect(() => {
    console.log('[PetsScreen] useEffect fired. userId:', userId);
    if (userId) {
      console.log('[PetsScreen] useEffect: dispatching fetchPetsAsync');
      dispatch(fetchPetsAsync(userId) as any);
    }
  }, [dispatch, userId]);

  const handleAddPet = () => {
    console.log('[PetsScreen] handleAddPet triggered');
    dispatch(setEditingPet({
      id: '',
      owner_id: userId || '',
      name: '',
      species: '',
      breed: '',
      age: undefined,
      weight: undefined,
      care: {},
      photos: [],
      vetInfo: '',
    }));
  };

  console.log('[PetsScreen] Render: petsList', petsList, 'loading', loading, 'error', error);
  // Debug: log petsList type and length
  console.log('[PetsScreen] petsList type:', typeof petsList, 'isArray:', Array.isArray(petsList), 'length:', petsList ? petsList.length : 'N/A');
  return (
    <View style={styles.outerContainer}>
      {/* Gradient Glassmorphism Background */}
      <View style={styles.gradientBg} pointerEvents="none" />
      <View style={styles.container}>
        {loading && <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 32 }} />}
        {error && <Text style={styles.error}>{error}</Text>}
        {!loading && (petsList?.length === 0) && <EmptyStatePets onAddPet={handleAddPet} />}
        {!loading && (petsList?.length > 0) && <PetsList pets={petsList || []} />}
        <AddPetFAB onPress={handleAddPet} />
        {editingPet && <PetDetailModal />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#e3e9f7',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    opacity: 0.95,
    backgroundColor: 'transparent',
    // Glassmorphism: gradient + blur
    // This requires expo-blur or react-native-blur for best effect; fallback is a gradient color
    // If you use expo, replace with <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill} />
    // Here, fallback to a vertical gradient using linear-gradient colors
    // You can use react-native-linear-gradient for a real gradient
    borderRadius: 0,
    // Example fallback color
    // backgroundColor: '#f5f8ff',
  },
  container: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 0,
    justifyContent: 'flex-start',
  },
  error: {
    color: '#e53935',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});

export default PetsScreen;

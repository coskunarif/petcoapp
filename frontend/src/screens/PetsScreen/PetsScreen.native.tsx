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
  // Debug: log full Redux state
  const fullState = useSelector((state: RootState) => state);
  console.log('[PetsScreen] Full Redux state:', fullState);
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
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 32 }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {!loading && (petsList?.length === 0) && <EmptyStatePets onAddPet={handleAddPet} />}
      {!loading && (petsList?.length > 0) && <PetsList pets={petsList || []} />}
      <AddPetFAB onPress={handleAddPet} />
      {editingPet && <PetDetailModal />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default PetsScreen;

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchPetsAsync, setEditingPet } from '../../store/petsSlice';
import PetsList from './PetsList.native';
import EmptyStatePets from './EmptyStatePets.native';
import AddPetFAB from './AddPetFAB.native';
import PetDetailModal from './PetDetailModal.native';

const mockUserId = 'demo-user-123'; // Replace with real auth user ID

const PetsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { petsList, loading, error, editingPet } = useSelector((state: RootState) => state.pets);

  useEffect(() => {
    dispatch(fetchPetsAsync(mockUserId) as any);
  }, [dispatch]);

  const handleAddPet = () => {
    dispatch(setEditingPet({
      id: '',
      user_id: mockUserId,
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

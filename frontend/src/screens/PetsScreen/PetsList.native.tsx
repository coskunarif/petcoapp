import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import PetCard from '../../components/PetCard.native';
import { Pet, setEditingPet, deletePetAsync } from '../../store/petsSlice';

interface PetsListProps {
  pets: Pet[];
}

const PetsList: React.FC<PetsListProps> = ({ pets }) => {
  const dispatch = useDispatch();

  const handleEdit = (pet: Pet) => {
    dispatch(setEditingPet(pet));
  };

  const handleDelete = (pet: Pet) => {
    // Use Alert for confirmation in React Native
    // You can replace with a better dialog if you like
    if (global.confirm) {
      if (global.confirm(`Are you sure you want to delete ${pet.name}?`)) {
        dispatch(deletePetAsync(pet.id) as any);
      }
    } else {
      dispatch(deletePetAsync(pet.id) as any);
    }
  };

  return (
    <FlatList
      data={pets}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <PetCard pet={item} onEdit={handleEdit} onDelete={handleDelete} />
      )}
      contentContainerStyle={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 80,
  },
});

export default PetsList;

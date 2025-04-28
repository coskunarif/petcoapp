import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import PetCard from '../../components/PetCard.native';
import { Pet, setEditingPet, deletePetAsync } from '../../store/petsSlice';

interface PetsListProps {
  pets: Pet[];
}

import ConfirmationModal from '../../components/ConfirmationModal.native';

const PetsList: React.FC<PetsListProps> = ({ pets }) => {
  const dispatch = useDispatch();
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [petToDelete, setPetToDelete] = React.useState<Pet | null>(null);

  const handleEdit = (pet: Pet) => {
    dispatch(setEditingPet(pet));
  };

  const handleDelete = (pet: Pet) => {
    setPetToDelete(pet);
    setConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    if (petToDelete) {
      dispatch(deletePetAsync(petToDelete.id) as any);
    }
    setConfirmVisible(false);
    setPetToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmVisible(false);
    setPetToDelete(null);
  };

  return (
    <>
      <FlatList
        data={pets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PetCard pet={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        contentContainerStyle={styles.list}
      />
      <ConfirmationModal
        visible={confirmVisible}
        message={`Are you sure you want to delete${petToDelete ? ` ${petToDelete.name}` : ''}?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        iconName="delete-outline"
        iconColor="#d32f2f"
      />
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingBottom: 80,
  },
});

export default PetsList;

import React from 'react';
import { FlatList, View, StyleSheet, RefreshControl, Platform } from 'react-native';
import { useDispatch } from 'react-redux';
import PetCard from '../../components/PetCard.native';
import { Pet, setEditingPet, deletePetAsync, fetchPetsAsync } from '../../store/petsSlice';
import { theme } from '../../theme';
import ConfirmationModal from '../../components/ConfirmationModal.native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface PetsListProps {
  pets: Pet[];
  scrollEventListener?: (event: any) => void;
}

const PetsList: React.FC<PetsListProps> = ({ pets, scrollEventListener }) => {
  const dispatch = useDispatch();
  const [confirmVisible, setConfirmVisible] = React.useState(false);
  const [petToDelete, setPetToDelete] = React.useState<Pet | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

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

  const onRefresh = () => {
    setRefreshing(true);
    if (userId) {
      dispatch(fetchPetsAsync(userId) as any)
        .finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
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
        showsVerticalScrollIndicator={false}
        onScroll={scrollEventListener}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
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
    paddingTop: Platform.OS === 'ios' ? 60 : 50, // Reduced space after header
    paddingBottom: 100, // Space for FAB
    paddingHorizontal: theme.spacing.md,
  },
});

export default PetsList;

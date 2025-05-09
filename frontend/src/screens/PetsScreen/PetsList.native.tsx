import React, { useState, useCallback } from 'react';
import { FlatList, View, StyleSheet, RefreshControl, Platform, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import PetCard from '../../components/PetCard.native';
import { Pet, setEditingPet, deletePetAsync, fetchPetsAsync } from '../../store/petsSlice';
import { theme } from '../../theme';
import ConfirmationModal from '../../components/ConfirmationModal.native';
import { RootState } from '../../store';

interface PetsListProps {
  pets: Pet[];
  scrollEventListener?: (event: any) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

const PetsList: React.FC<PetsListProps> = ({ 
  pets, 
  scrollEventListener, 
  onRefresh: externalRefresh,
  refreshing: externalRefreshing 
}) => {
  const dispatch = useDispatch();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const loading = useSelector((state: RootState) => state.pets.loading);

  // Use either external or internal refresh state
  const refreshing = externalRefreshing !== undefined ? externalRefreshing : internalRefreshing;

  const handleEdit = useCallback((pet: Pet) => {
    console.log('[PetsList] Editing pet:', pet.id);
    dispatch(setEditingPet(pet));
  }, [dispatch]);

  const handleDelete = useCallback((pet: Pet) => {
    console.log('[PetsList] Preparing to delete pet:', pet.id);
    setPetToDelete(pet);
    setConfirmVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (petToDelete) {
      console.log('[PetsList] Confirming deletion of pet:', petToDelete.id);
      dispatch(deletePetAsync(petToDelete.id) as any)
        .unwrap()
        .then(() => {
          console.log('[PetsList] Pet deleted successfully');
        })
        .catch((err: any) => {
          console.error('[PetsList] Error deleting pet:', err);
          Alert.alert('Error', `Failed to delete pet: ${err.message || err}`);
        });
    }
    setConfirmVisible(false);
    setPetToDelete(null);
  }, [dispatch, petToDelete]);

  const handleCancelDelete = useCallback(() => {
    console.log('[PetsList] Cancelling pet deletion');
    setConfirmVisible(false);
    setPetToDelete(null);
  }, []);

  const handleRefresh = useCallback(() => {
    if (!userId) {
      console.warn('[PetsList] Cannot refresh: No user ID');
      return;
    }
    
    // Use external refresh handler if provided
    if (externalRefresh) {
      console.log('[PetsList] Using external refresh handler');
      externalRefresh();
      return;
    }
    
    // Otherwise use internal refresh logic
    console.log('[PetsList] Refreshing pets list');
    setInternalRefreshing(true);
    
    dispatch(fetchPetsAsync(userId) as any)
      .finally(() => {
        setInternalRefreshing(false);
      });
  }, [userId, dispatch, externalRefresh]);

  return (
    <>
      <FlatList
        data={pets}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PetCard 
            pet={item} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
          />
        )}
        contentContainerStyle={[
          styles.list,
          // Add extra padding if list is empty to center content better
          pets.length === 0 && styles.emptyList
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={scrollEventListener}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
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
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default PetsList;

import React from 'react';
import { useDispatch } from 'react-redux';
import PetCard from '../../components/PetCard';
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
    if (window.confirm(`Are you sure you want to delete ${pet.name}?`)) {
      dispatch(deletePetAsync(pet.id) as any);
    }
  };

  return (
    <div>
      {pets.map((pet) => (
        <PetCard key={pet.id} pet={pet} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
    </div>
  );
};

export default PetsList;

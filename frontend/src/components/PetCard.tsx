import React from 'react';
import { Pet } from '../store/petsSlice';

interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (pet: Pet) => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: 16, border: '1px solid #eee', borderRadius: 12, marginBottom: 16, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
      {/* Circular image */}
      <img
        src={pet.photos && pet.photos[0] ? pet.photos[0] : 'https://placekitten.com/80/80'}
        alt={pet.name}
        style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginRight: 16, background: '#eee' }}
        loading="lazy"
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 18 }}>{pet.name || <span style={{ color: '#aaa' }}>Unnamed Pet</span>}</div>
        <div style={{ color: '#666' }}>{pet.breed || <span style={{ color: '#ccc' }}>Breed unknown</span>}</div>
        <div style={{ color: '#999', fontSize: 12 }}>{pet.species || 'Species'}
          {pet.age !== undefined && pet.age !== null ? ` • ${pet.age} yrs` : ''}
        </div>
      </div>
      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          aria-label={`Edit ${pet.name}`}
          style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: 18 }}
          onClick={() => onEdit && onEdit(pet)}
        >
          ✏️
        </button>
        <button
          aria-label={`Delete ${pet.name}`}
          style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: 18 }}
          onClick={() => onDelete && onDelete(pet)}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default PetCard;

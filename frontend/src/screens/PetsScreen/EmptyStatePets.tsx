import React from 'react';

interface EmptyStatePetsProps {
  onAddPet: () => void;
}

const EmptyStatePets: React.FC<EmptyStatePetsProps> = ({ onAddPet }) => (
  <div style={{ textAlign: 'center', marginTop: 64 }}>
    {/* TODO: Add illustration */}
    <h2>No pets added yet</h2>
    <p>Add your first pet to get started!</p>
    <button onClick={onAddPet} style={{ marginTop: 24, padding: '12px 24px', fontSize: 16, borderRadius: 8, background: '#1976d2', color: 'white', border: 'none', cursor: 'pointer' }}>
      Add Pet
    </button>
  </div>
);

export default EmptyStatePets;

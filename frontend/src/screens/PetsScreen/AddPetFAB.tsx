import React from 'react';

interface AddPetFABProps {
  onClick: () => void;
}

const AddPetFAB: React.FC<AddPetFABProps> = ({ onClick }) => (
  <button
    style={{
      position: 'fixed',
      bottom: 32,
      right: 32,
      borderRadius: '50%',
      width: 56,
      height: 56,
      background: '#1976d2',
      color: 'white',
      fontSize: 32,
      border: 'none',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      cursor: 'pointer',
      zIndex: 1000,
    }}
    aria-label="Add Pet"
    onClick={onClick}
  >
    +
  </button>
);

export default AddPetFAB;

import React from 'react';
import { EmptyState } from '../../components/ui';

interface EmptyStatePetsProps {
  onAddPet: () => void;
}

const EmptyStatePets: React.FC<EmptyStatePetsProps> = ({ onAddPet }) => {
  try {
    console.log('[EmptyStatePets] About to render EmptyState with icon: paw');
    return (
      <EmptyState
        icon="paw"
        title="No pets added yet"
        description="Add your furry friends to help caregivers provide the best service"
        buttonTitle="Add Pet"
        onButtonPress={onAddPet}
      />
    );
  } catch (err) {
    console.error('[EmptyStatePets] Error rendering EmptyState:', err);
    return null;
  }
};

export default EmptyStatePets;

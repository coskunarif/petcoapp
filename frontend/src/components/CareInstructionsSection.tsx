import React from 'react';

interface CareInstructionsSectionProps {
  care: any;
  onChange: (field: string, value: any) => void;
}

const CareInstructionsSection: React.FC<CareInstructionsSectionProps> = ({ care, onChange }) => (
  <section style={{ marginBottom: 24 }}>
    <h3 style={{ marginBottom: 12 }}>Care Instructions</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label>
        Feeding
        <input
          type="text"
          value={care.feeding || ''}
          onChange={e => onChange('feeding', e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
      </label>
      <label>
        Medication
        <input
          type="text"
          value={care.medication || ''}
          onChange={e => onChange('medication', e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
      </label>
      <label>
        Exercise
        <input
          type="text"
          value={care.exercise || ''}
          onChange={e => onChange('exercise', e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
      </label>
      <label>
        Special Instructions
        <textarea
          value={care.specialInstructions || ''}
          onChange={e => onChange('specialInstructions', e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', minHeight: 48 }}
        />
      </label>
    </div>
  </section>
);

export default CareInstructionsSection;

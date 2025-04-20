import React from 'react';

interface BasicInfoSectionProps {
  form: any;
  onChange: (field: string, value: any) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ form, onChange }) => (
  <section style={{ marginBottom: 24 }}>
    <h3 style={{ marginBottom: 12 }}>Basic Information</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <label>
        Name*
        <input
          type="text"
          value={form.name || ''}
          onChange={e => onChange('name', e.target.value)}
          required
          aria-required="true"
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
      </label>
      <label>
        Species*
        <input
          type="text"
          value={form.species || ''}
          onChange={e => onChange('species', e.target.value)}
          required
          aria-required="true"
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
      </label>
      <label>
        Breed
        <input
          type="text"
          value={form.breed || ''}
          onChange={e => onChange('breed', e.target.value)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
      </label>
      <label>
        Age (years)
        <input
          type="number"
          min={0}
          value={form.age ?? ''}
          onChange={e => onChange('age', e.target.value ? Number(e.target.value) : undefined)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
      </label>
      <label>
        Weight (kg)
        <input
          type="number"
          min={0}
          value={form.weight ?? ''}
          onChange={e => onChange('weight', e.target.value ? Number(e.target.value) : undefined)}
          style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
        />
      </label>
    </div>
  </section>
);

export default BasicInfoSection;

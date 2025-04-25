import React from 'react';

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEnter?: () => void;
};

const TextInput = ({ value, onChange, onEnter }: Props) => (
  <input
    type="text"
    placeholder="Type a message..."
    value={value}
    onChange={onChange}
    onKeyDown={e => {
      if (e.key === 'Enter' && onEnter) onEnter();
    }}
  />
);

export default TextInput;

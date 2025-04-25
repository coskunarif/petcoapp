import React from 'react';

import { TextInput } from 'react-native';

const SearchBar = () => (
  <TextInput
    placeholder="Search conversations..."
    style={{
      backgroundColor: '#f0f0f0',
      borderRadius: 8,
      padding: 10,
      margin: 10,
    }}
  />
);

export default SearchBar;

import React from 'react';

const ImageAttachmentButton = () => {
  // TODO: Implement image upload and compression
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Upload logic goes here
      alert('Image upload stub: ' + file.name);
    }
  };

  return (
    <label>
      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      <button type="button">Attach Image</button>
    </label>
  );
};

export default ImageAttachmentButton;

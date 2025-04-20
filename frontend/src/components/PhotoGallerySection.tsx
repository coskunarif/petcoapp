import React, { useRef } from 'react';

interface PhotoGallerySectionProps {
  photos: string[];
  onUpload: (file: File) => void;
  uploadProgress: number;
}

const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({ photos, onUpload, uploadProgress }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) onUpload(file);
  };

  return (
    <section style={{ marginBottom: 24 }}>
      <h3 style={{ marginBottom: 12 }}>Photo Gallery</h3>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        {photos && photos.length > 0 ? (
          photos.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`Pet photo ${idx + 1}`}
              style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc' }}
              loading="lazy"
            />
          ))
        ) : (
          <span style={{ color: '#888' }}>No photos uploaded yet.</span>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-label="Upload pet photo"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        style={{ padding: '8px 18px', borderRadius: 6, border: '1px solid #1976d2', background: '#fff', color: '#1976d2', fontWeight: 600, cursor: 'pointer' }}
        aria-label="Add photo"
      >
        Upload Photo
      </button>
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#1976d2' }}>Uploading... {uploadProgress}%</div>
      )}
    </section>
  );
};

export default PhotoGallerySection;

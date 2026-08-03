import React, { useRef, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react'; 

const ImageUploader = ({ onImageSelected, image, onDelete, label = "Imagen del Producto" }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Generate a preview URL if the image is a File object (new upload),
  // or use the string directly if it's a URL (existing database image).
  useEffect(() => {
    if (!image) {
      setPreviewUrl(null);
      return;
    }

    if (image instanceof File) {
      const objectUrl = URL.createObjectURL(image);
      setPreviewUrl(objectUrl);
      
      // Clean up the object URL to avoid memory leaks
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof image === 'string') {
      setPreviewUrl(image);
    }
  }, [image]);

  const handleContainerClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (onImageSelected) {
        onImageSelected(files);
      }
    }
    // Reset the input value so the same file can be selected again if deleted
    event.target.value = '';
  };

  const handleDeleteClick = (event) => {
    event.stopPropagation(); // Prevent the hidden file input from triggering
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div 
      className="image-uploader-container" 
      onClick={handleContainerClick}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%', 
        overflow: 'hidden',
        border: previewUrl ? '1px solid var(--border-light)' : '1px dashed var(--border-light)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background-light, #f9fafb)',
        borderRadius: '8px'
      }}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept="image/*" 
        multiple 
      />
      
      {previewUrl ? (
        <>
          <img 
            src={previewUrl} 
            alt="Visual del producto" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          
          {/* Delete Button */}
          {onDelete && (
            <button
              type="button"
              onClick={handleDeleteClick}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                cursor: 'pointer',
                zIndex: 10
              }}
              title="Eliminar imagen"
            >
              <Trash2 size={18} color="#dc2626" />
            </button>
          )}

          {/* Dynamic Banner overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            <Pencil size={16} /> Edit
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <Plus color="var(--text-secondary, #6b7280)" size={32} />
          <span className="image-uploader-text" style={{ color: 'var(--text-secondary, #6b7280)', fontSize: '0.9rem' }}>
            {label} 
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
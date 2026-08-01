import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import Input from './Input';
import Checkbox from './Checkbox';
import Toast from './Toast';
import ImageUploader from './ImageUploader';

const CustomizationInputGroup = ({ customization, onChange, onDelete }) => {
  const name = customization?.field || customization?.name || '';
  const isRequired = customization?.required !== false; 
  const options = customization?.options || [{ id: Date.now(), name: '', price: '', image: null }];

  const handleNameChange = (e) => {
    onChange({ field: e.target.value });
  };

  const handleRequiredChange = () => {
    onChange({ required: !isRequired });
  };

  const addOption = () => {
    onChange({ 
      options: [...options, { id: Date.now(), name: '', price: '', image: null }] 
    });
  };

  const handleOptionChange = (optionId, fieldToUpdate, value) => {
    const updatedOptions = options.map(opt => 
      opt.id === optionId ? { ...opt, [fieldToUpdate]: value } : opt
    );
    onChange({ options: updatedOptions });
  };

  const [showWarningToast, setShowWarningToast] = useState(false);

  const handleDeleteOption = (optionId) => {
    if (options.length <= 1) {
      setShowWarningToast(true);
    
      setTimeout(() => {
        setShowWarningToast(false);
      }, 2000);
      
      return; 
    }

    const updatedOptions = options.filter(opt => opt.id !== optionId);
    onChange({ options: updatedOptions });
  };

  return (
    <div className="customization-detail-card" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Row */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <Input 
            id={`field-name-${customization.id}`} 
            label="Customization name" 
            required={true} 
            value={name}
            onChange={handleNameChange}
          />
        </div>
        <button 
          type="button" 
          onClick={onDelete}
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            padding: '0.5rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          aria-label="Delete Customization"
        >
          <Trash2 size={24} />
        </button>
      </div>

      {/* Required Checkbox */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
         <Checkbox  
           id={`required-checkbox-${customization.id}`} 
           label="Required" 
           checked={isRequired} 
           onChange={handleRequiredChange}
         />
      </div>
      
      <div className="divider" style={{ margin: '1rem 0' }}></div>
      
      {/* Options List */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {options.map((option, index) => (
          <React.Fragment key={option.id}>
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch' }}>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {/* Option Trash Pill */}   
                  <button 
                    type="button"
                    onClick={() => handleDeleteOption(option.id)}
                    style={{
                      width: '50px',
                      height: '30px',
                      backgroundColor: '#e2e8f0',
                      border: 'none',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#e2e8f0';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                    aria-label="Delete Option"
                  >
                    <Trash2 size={22} />
                  </button>
                
                <Input 
                    id={`option-name-${option.id}`} 
                    label={`Option ${index + 1}`} 
                    value={option.name}
                    onChange={(e) => handleOptionChange(option.id, 'name', e.target.value)}
                  />

                {/* Price and Image */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                  
                  <Input 
                    id={`option-price-${option.id}`} 
                    label="Price" 
                    prefix="$" 
                    type="number"
                    value={option.price}
                    onChange={(e) => handleOptionChange(option.id, 'price', e.target.value)}
                  />
                

              {/* Image Uploader */}
              <div 
                style={{
                  width: '30%', 
                  flexShrink: 0,
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!option.image) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-color)';
                    e.currentTarget.style.borderColor = 'var(--primary-purple)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!option.image) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = 'var(--border-light)';
                  }
                }}
                title="Upload Image"
              >
                <ImageUploader 
                  image={option.image}
                  onImageSelected={(files) => handleOptionChange(option.id, 'image', files[0])}
                  onDelete={() => handleOptionChange(option.id, 'image', null)}
                />
              </div>
              </div>
              </div>
            </div>

            <div className="divider" style={{ margin: '1.5rem 0' }}></div>
          </React.Fragment>
        ))}
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-0.5rem' }}>
          <button 
            type="button" 
            className="text-action-link" 
            onClick={addOption}
            style={{ fontSize: '1rem' }}
          >
            + Add another option
          </button>
        </div>
      </div>

      <Toast 
        show={showWarningToast} 
        message="You must have at least one option." 
      />
      
    </div>
  );
};

export default CustomizationInputGroup;
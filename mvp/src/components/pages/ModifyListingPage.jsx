import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import HeaderText from '../HeaderText';
import Input from '../Input';
import ActionButton from '../ActionButton';
import Badge from '../Badge';
import BackButton from '../BackButton';
import ImageUploader from '../ImageUploader';
import ImageCarousel from '../ImageCarousel';
import Image from '../Image'; 
import Toast from '../Toast';
import CustomizationInputGroup from '../CustomizationInputGroup';

const ModifyListingPage = ({ 
  pageTitle, 
  buttonText, 
  initialData = {}, 
  onSubmitSuccess, 
  successMessage,
  onSave 
}) => {
  const navigate = useNavigate(); 

  const [images, setImages] = useState(() => {
    if (Array.isArray(initialData.image)) return initialData.image; 
    if (typeof initialData.image === 'string' && initialData.image.trim() !== '') return [initialData.image]; 
    return []; 
  });

  const [productName, setProductName] = useState(initialData.name || ''); 
  const [productPrice, setProductPrice] = useState(initialData.price || ''); 
  const [description, setDescription] = useState(initialData.description || ''); 
  const [amount, setAmount] = useState(initialData.amount || ''); 
  const [showToast, setShowToast] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const isSubmittingRef = useRef(false);
  
  // States to track validation errors
  const [errors, setErrors] = useState({}); 
  const [customizationErrors, setCustomizationErrors] = useState({});

  const [customizations, setCustomizations] = useState(() => {
    const custs = initialData.customizations || [];
    return custs.map(cust => ({
      ...cust,
      options: cust.options?.map(opt => ({
        ...opt,
        image: opt.image !== undefined ? opt.image : (opt.image_url || null)
      })) || []
    }));
  });

  const displayImages = images.map(img => 
    img instanceof File ? URL.createObjectURL(img) : img
  );

  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []);

  const handleAddCustomization = () => {
    setCustomizations([
      ...customizations, 
      { 
        id: Date.now(), 
        field: '',         
        required: true,    
        options: [{ id: Date.now() + 1, name: '', price: '', image: null }] 
      }
    ]);
  };

  const handleCustomizationChange = (id, updatedFields) => {
    setCustomizations(customizations.map(cust => 
      cust.id === id ? { ...cust, ...updatedFields } : cust 
    ));
    
    // Validate customization options dynamically
    if (updatedFields.options) {
      const optionErrors = {};
      updatedFields.options.forEach(opt => {
        if (opt.price !== '' && parseFloat(opt.price) < 0) {
          optionErrors[opt.id] = 'Los números deben ser de al menos 0';
        }
      });

      setCustomizationErrors(prev => {
        const newErrors = { ...prev };
        if (Object.keys(optionErrors).length > 0) {
          newErrors[id] = optionErrors;
        } else {
          delete newErrors[id];
        }
        return newErrors;
      });
    }
  };

  const handleDeleteCustomization = (idToRemove) => {
    setCustomizations(customizations.filter((cust) => cust.id !== idToRemove)); 
    // Clean up associated errors when a block is deleted
    if (customizationErrors[idToRemove]) {
      const updatedErrors = { ...customizationErrors };
      delete updatedErrors[idToRemove];
      setCustomizationErrors(updatedErrors);
    }
  };

  const handleImageUpload = (files) => {
    const newFilesArray = Array.from(files);
    setImages((prevImages) => [...prevImages, ...newFilesArray]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    if (isSubmittingRef.current) {
      return;
    }
    
    if (Object.values(errors).some(err => err !== null) || Object.keys(customizationErrors).length > 0) {
      return; 
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true); 

    const formData = {
      name: productName, 
      price: productPrice,  
      description, 
      amount,               
      customizations, 
      productImages: images 
    };

    let isSuccess = true; 
    if (onSave) {
      isSuccess = await onSave(formData); 
    }

    if (isSuccess) {
      // SUCCESS: Leave isSubmitting as true so the button stays disabled!
      setShowToast(true); 
      setTimeout(() => {
        setShowToast(false); 
        setTimeout(() => {
          if (onSubmitSuccess) {
            onSubmitSuccess(); 
          } else {
            navigate(-1); 
          }
        }, 300); 
      }, 2000); 
    } else {
      // FAIL: Only unlock the button if there was an error saving, 
      // so the user can fix it and try again.
      isSubmittingRef.current = false;
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="page-container flex-center" style={{ width: '100%', paddingBottom: '6rem' }}>
      <div className="create-listing-container">
        
        <BackButton showBackground={true} pushElementsDown={false} />
        <HeaderText text={pageTitle} className="header-text-center" />

        <form onSubmit={handleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); 
                }
        }}>

          <div className="form-inputs">
            
            {/* Dynamic Image Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
              {images.length === 0 ? (
                <div style={{ height: '250px', width: '100%' }}>
                  <ImageUploader onImageSelected={handleImageUpload} />
                </div>
              ) : (
                <>
                  <div 
                    style={{ 
                      position: 'relative',  
                      width: '100%',  
                      height: '250px',  
                      borderRadius: '16px',  
                      overflow: 'hidden',  
                      cursor: 'pointer', 
                      border: '1px solid var(--border-light)' 
                    }}
                    title="Editar imágenes"
                  >
                    {images.length === 1 ? (
                      <div style={{ width: '100%', height: '100%' }}>
                        <Image 
                          src={displayImages[0]} 
                          alt="Vista del producto"  
                          containerClass="carousel-image-wrapper"  
                          imgClass="carousel-image"  
                        />
                      </div>
                    ) : (
                      <ImageCarousel images={displayImages} />
                    )}
                  </div>

                  <div style={{ 
                    display: 'grid',  
                    gridTemplateColumns: '80px minmax(0, 1fr)',  
                    gap: '0.5rem',  
                    width: '100%', 
                    alignItems: 'center' 
                  }}>
                    <div style={{ height: '80px', width: '100%' }}>
                      <ImageUploader onImageSelected={handleImageUpload} label = ""/>
                    </div>
                    
                    <div style={{ 
                    display: 'flex',  
                    gap: '0.5rem',  
                    overflowX: 'auto', 
                    scrollbarWidth: 'none', 
                  }}>
                    {displayImages.map((imgSrc, index) => (
                      <div 
                        key={index} 
                        onClick={() => {
                          setImages(images.filter((_, i) => i !== index)); 
                        }}
                        style={{ 
                          position: 'relative',  
                          width: '80px',  
                          height: '80px',  
                          flexShrink: 0,  
                          borderRadius: '8px',  
                          overflow: 'hidden',  
                          border: '1px solid var(--border-light)', 
                          cursor: 'pointer'  
                        }}
                      >
                        <Image 
                          src={imgSrc} 
                          alt={`Miniatura ${index + 1}`} 
                          containerClass="carousel-image-wrapper"  
                          imgClass="carousel-image"  
                        />
                        
                        <div style={{
                          position: 'absolute', 
                          bottom: 0, 
                          width: '100%', 
                          backgroundColor: 'rgba(0, 0, 0, 0.65)', 
                          color: 'white', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '0.25rem', 
                          padding: '0.15rem 0', 
                          fontSize: '1rem', 
                          fontWeight: '600' 
                        }}>
                          <Trash2 size={18} />
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </>
              )}
            </div>

            <Input 
              id="product-name"  
              label="Nombre"  
              required={true} 
              value={productName} 
              onChange={(e) => setProductName(e.target.value)} 
            />

            <div>
              <Input 
                id="product-price"  
                label="Precio base" 
                type='number'  
                required={true} 
                value={productPrice} 
                onChange={(e) => {
                  const val = e.target.value;
                  setProductPrice(val);
                  
                  // Real-time validation for price
                  if (val !== '' && parseFloat(val) < 0) {
                    setErrors(prev => ({ ...prev, price: 'Los números deben ser de al menos 0' }));
                  } else {
                    setErrors(prev => ({ ...prev, price: null }));
                  }
                }} 
              />
              {errors.price && (
                <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block', textAlign: 'left' }}>
                  {errors.price}
                </span>
              )}
            </div>

            <div>
              <Input 
                id="amount-available"  
                label="Cantidad disponible"  
                type="number"  
                value={amount} 
                onChange={(e) => {
                  const val = e.target.value;
                  setAmount(val);
                  
                  // Real-time validation for amount
                  if (val !== '') {
                    const numAmount = Number(val);
                    if (parseFloat(val) < 0) {
                      setErrors(prev => ({ ...prev, amount: 'Los números deben ser de al menos 0' }));
                    } else if (!Number.isInteger(numAmount)) {
                      setErrors(prev => ({ ...prev, amount: 'La cantidad disponible debe ser un número entero' }));
                    } else {
                      setErrors(prev => ({ ...prev, amount: null }));
                    }
                  } else {
                    setErrors(prev => ({ ...prev, amount: null }));
                  }
                }} 
              />
              {errors.amount && (
                <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block', textAlign: 'left' }}>
                  {errors.amount}
                </span>
              )}
            </div>

            <Input 
              id="description"  
              label="Descripción"  
              type="textarea" 
              required={false} 
              rows={4}  
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />

            <div className="divider"></div>

            {customizations.map((cust) => (
              <CustomizationInputGroup 
                key={cust.id}  
                customization={cust} 
                onChange={(updatedFields) => handleCustomizationChange(cust.id, updatedFields)} 
                onDelete={() => handleDeleteCustomization(cust.id)}
                errors={customizationErrors[cust.id] || {}} 
              />
            ))}

            <div className="customization-header-row flex-center" style={{ padding: '0.5rem 0', justifyContent: 'center' }}>
              <button 
                type="button"  
                className="text-action-link bold-link"  
                onClick={handleAddCustomization} 
              >
                + Personalización
              </button>
            </div>
            <div className="divider"></div>
          </div>

          <div className="footer-action">
            <ActionButton 
              text={isSubmitting ? 'Guardando...' : buttonText} 
              type="submit" 
              disabled={isSubmitting || Object.values(errors).some(err => err !== null) || Object.keys(customizationErrors).length > 0} 
            />
          </div>
       </form>

       <Toast show={showToast} message={successMessage} />
      </div>
    </div>
  );
};

export default ModifyListingPage;
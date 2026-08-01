import React, { useState, useEffect } from 'react';
import HeaderText from '../HeaderText';
import Input from '../Input';
import ActionButton from '../ActionButton';
import BackButton from '../BackButton';
import CartButton from '../CartButton';
import ImageCarousel from '../ImageCarousel';

const ProductPage = ({ product, onAddToCart, onBack }) => {
  const [customizations, setCustomizations] = useState({});
  const [customMessage, setCustomMessage] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  let baseImages = [];
  if (Array.isArray(product.image)) {
    baseImages = [...product.image];
  } else if (product.image && typeof product.image === 'string' && product.image.trim() !== '') {
    baseImages = [product.image];
  }

  const customizationImages = [];
  if (product.customizations && product.customizations.length > 0) {
    product.customizations.forEach((cust) => {
      if (cust.options && cust.options.length > 0) {
        cust.options.forEach((option) => {
          if (option.image && typeof option.image === 'string' && option.image.trim() !== '') {
            customizationImages.push(option.image);
          }
        });
      }
    });
  }

  const images = [...baseImages, ...customizationImages];

  const handleCustomizationChange = (field, value) => {
    setCustomizations(prev => ({ ...prev, [field]: value }));

    if (value === '') {
      setActiveImageIndex(0);
      return;
    }

    const customization = product.customizations?.find(c => c.field === field);
    if (customization) {
      const selectedOption = customization.options.find(
        opt => String(opt.id) === String(value)
      );
      
      if (selectedOption && selectedOption.image) {
        const index = images.indexOf(selectedOption.image);
        if (index !== -1) {
          setActiveImageIndex(index);
        }
      }
    }
  };

  const handleAddToCart = () => {
    onAddToCart({
      product,
      customizations,
      customMessage,
      totalPrice
    });
  };

  const calculateTotalPrice = () => {
    let extraPrice = 0;
    
    if (product.customizations) {
      product.customizations.forEach(customization => {
        const selectedOptionId = customizations[customization.field];
        if (selectedOptionId) {
          const selectedOption = customization.options.find(
            opt => String(opt.id) === String(selectedOptionId)
          );
          if (selectedOption && selectedOption.price) {
            extraPrice += parseFloat(selectedOption.price);
          }
        }
      });
    }
    
    return product.price + extraPrice;
  };

  const totalPrice = calculateTotalPrice();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="product-page-layout">
      <BackButton goTo={onBack} />
      
      <div className="product-columns">
          
          {images.length > 0 ? (
            <div className="product-page-image-container">
              <div className="hero-image-container" style={{ height: '35vh', borderRadius: '1rem' }}>
                <ImageCarousel 
                  images={images} 
                  activeIndex={activeImageIndex}
                  onIndexChange={setActiveImageIndex} 
                />
              </div>
              
              {/* Rendered under image: Shown on Desktop, hidden on Mobile */}
              {product.description && (
                <div className="product-description desc-under-image">
                  {product.description}
                </div>
              )}
            </div>
          ) : null}

        <div className="product-details-container">
          <div className="product-header-group">
            <HeaderText text={product.name} />
            <span className="product-price-text">${totalPrice.toFixed(2)}</span>
            <span className="product-delivery-text">
              {product.delivery ? 'Delivery available' : 'Pick-up only'}
            </span>
          </div>

          {/* Rendered before customizations: Shown on Mobile, or Desktop if no images exist */}
          {product.description && (
            <div className={`product-description desc-before-cust ${images.length > 0 ? 'has-image' : ''}`}>
              {product.description}
            </div>
          )}

          <div className="form-inputs" style={{ marginTop: '0.5rem' }}>
            {product.customizations?.map((customization) => {
              
              // 1. Map out the standard options first
              const mappedOptions = customization.options.map(opt => {
                const priceAddition = parseFloat(opt.price) > 0 ? ` (+$${opt.price})` : '';
                return {
                  label: `${opt.name}${priceAddition}`,
                  value: opt.id
                };
              });

              // 2. Conditionally prepend the "None" option if the field is not required
              const formattedOptions = customization.required 
                ? mappedOptions 
                : [{ label: 'None', value: '' }, ...mappedOptions];

              return (
                <Input
                  key={customization.id}
                  type="dropdown"
                  id={`customization-${customization.id}`}
                  label={customization.field}
                  // 3. Dynamically set the required prop on the Input component
                  required={customization.required || false} 
                  options={formattedOptions}
                  value={customizations[customization.field] || ''}
                  onChange={(e) => handleCustomizationChange(customization.field, e.target.value)}
                />
              );
            })}

            <Input
              type="textarea"
              id="custom-message"
              label="Custom message"
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />

          </div>

          <div style={{ marginTop: '1rem' }}>
            <ActionButton text="Add to cart" onClick={handleAddToCart} />
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ProductPage;
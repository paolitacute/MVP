import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import HeaderText from '../HeaderText';
import Input from '../Input';
import ActionButton from '../ActionButton';
import BackButton from '../BackButton';
import CartButton from '../CartButton';
import ImageCarousel from '../ImageCarousel';

// 1. Accept the new initialCartData prop
const ProductPage = ({ product, onAddToCart, onBack, initialCartData }) => {
  // 2. Initialize customizations based on existing cart data if available
  const [customizations, setCustomizations] = useState(() => {
    if (!initialCartData || !initialCartData.selectedOptionIds) return {};
    
    const initial = {};
    if (product.customizations) {
      product.customizations.forEach((cust) => {
        // Map back from selectedOptionIds to the specific field
        const selectedOption = cust.options.find(opt => 
          initialCartData.selectedOptionIds.map(String).includes(String(opt.id))
        );
        if (selectedOption) {
          initial[cust.field] = selectedOption.id;
        }
      });
    }
    return initial;
  });

  // 3. Initialize custom message from cart data
  const [customMessage, setCustomMessage] = useState(initialCartData?.customMessage || '');
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

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
    
    // 2. Limpiar el error si el usuario selecciona una opción válida
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

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
    // 3. Validar personalizaciones requeridas antes de agregar al carrito
    let hasErrors = false;
    const newErrors = {};

    if (product.customizations) {
      product.customizations.forEach((cust) => {
        // Si es requerido y el usuario no ha seleccionado nada (está indefinido o vacío)
        if (cust.required && !customizations[cust.field]) {
          newErrors[cust.field] = 'Esta personalización es obligatoria.';
          hasErrors = true;
        }
      });
    }

    // Si hay errores, actualizamos el estado y detenemos la ejecución
    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Si todo está bien, limpiamos los errores y enviamos
    setErrors({});
    
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

  // Handle mouse wheel scrolling for desktop
  const handleModalWheel = (e) => {
    if (images.length > 1) {
      if (e.deltaY > 0) {
        setActiveImageIndex((prev) => (prev + 1) % images.length);
      } else {
        setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
  };

  // Touch handlers for mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(null); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && images.length > 1) {
      // Swipe left -> Next image
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    } else if (isRightSwipe && images.length > 1) {
      // Swipe right -> Previous image
      setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <>
    <CartButton floating={false}/>

    <div className="product-page-layout">
      <BackButton goTo={onBack} />
      
      <div className="product-columns">
          
          {images.length > 0 ? (
            <div className="product-page-image-container">
              <div 
                className="hero-image-container" 
                style={{ height: '35vh', borderRadius: '1rem', cursor: 'zoom-in' }}
                onClick={() => setIsImageModalOpen(true)}
              >
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
            <span className="product-price-text">RD${totalPrice.toFixed(2)}</span>
            <span className="product-delivery-text">
              {product.delivery ? 'Delivery disponible' : 'Solo para recoger'}
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
              
              const mappedOptions = customization.options.map(opt => {
                const priceAddition = parseFloat(opt.price) > 0 ? ` (+RD$${opt.price})` : '';
                return {
                  label: `${opt.name}${priceAddition}`,
                  value: opt.id
                };
              });

              const formattedOptions = customization.required 
                ? mappedOptions 
                : [{ label: 'Ninguno', value: '' }, ...mappedOptions];

              // 4. Se envuelve el input en un div para mostrar el mensaje de error debajo si corresponde
              return (
                <div key={customization.id}>
                  <Input
                    type="dropdown"
                    id={`customization-${customization.id}`}
                    label={customization.field}
                    required={customization.required || false} 
                    options={formattedOptions}
                    value={customizations[customization.field] || ''}
                    onChange={(e) => handleCustomizationChange(customization.field, e.target.value)}
                  />
                  {errors[customization.field] && (
                    <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block', textAlign: 'left' }}>
                      {errors[customization.field]}
                    </span>
                  )}
                </div>
              );
            })}

            <Input
              type="textarea"
              id="custom-message"
              label="Mensaje personalizado"
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />

          </div>

          <div style={{ marginTop: '1rem' }}>
            {/* 4. Update the button text to reflect the action */}
            <ActionButton 
              text={initialCartData ? "Actualizar carrito" : "Añadir al carrito"} 
              onClick={handleAddToCart} 
            />
          </div>
        </div>
      </div>

      {/* Modal de pantalla completa interactivo */}
      {isImageModalOpen && images.length > 0 && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)', 
            zIndex: 9999, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out'
          }}
          onClick={() => setIsImageModalOpen(false)} 
          onWheel={handleModalWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Flecha Izquierda (Visible principalmente en desktop) */}
          {images.length > 1 && (
            <button
              className="carousel-control carousel-prev"
              onClick={(e) => {
                e.stopPropagation(); 
                setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
              }}
            >
              <ArrowLeft size={24} color="var(--text-main, #333)" />
            </button>
          )}

          <img 
            src={images[activeImageIndex]} 
            alt={product.name} 
            onClick={(e) => e.stopPropagation()} 
            style={{
              maxWidth: '85vw', 
              maxHeight: '90vh', 
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 4px 25px rgba(0,0,0,0.5)',
              cursor: 'default'
            }} 
          />

          {/* Flecha Derecha (Visible principalmente en desktop) */}
          {images.length > 1 && (
            <button
              className="carousel-control carousel-next"
              onClick={(e) => {
                e.stopPropagation(); 
                setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
              }}
            >
              <ArrowRight size={24} color="var(--text-main, #333)" />
            </button>
          )}
        </div>
      )}
      
    </div>
    </>
  );
};

export default ProductPage;
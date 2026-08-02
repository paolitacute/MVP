import React, { useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react'; // Added Trash2
import { useNavigate } from 'react-router-dom';
import Image from '../Image';
import CategoryDetail from '../CategoryDetail';
import BackButton from '../BackButton';
import ActionsMenu from '../ActionsMenu'; // Added ActionsMenu

// Helper to calculate a single product's total price including customizations
const calculateProductPrice = (product) => {
  if (!product || !product.price) return 0;
  const basePrice = parseFloat(product.price.replace('$', '')) || 0;
  const customizationsPrice = product.customizations?.reduce((sum, cust) => {
    return sum + (parseFloat(cust.price.replace('$', '')) || 0);
  }, 0) || 0;
  
  return basePrice + customizationsPrice;
};

const ProductOrderedDetailPage = ({ product }) => {
  const navigate = useNavigate();

  // Moved useEffect here (inside the component) to follow React Hook rules
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Configure menu options
  const menuOptions = [
    {
      label: 'Eliminar artículo',
      icon: <Trash2 size={16} />,
      color: '#ef4444', // Red text and icon color
      onClick: () => console.log(`Product ${product?.id || 'deleted'} deleted`)
    }
  ];

  if (!product) {
    return (
      <div className="page-container">
        <h2 className="header-text-center">Producto no encontrado</h2>
      </div>
    );
  }

  // Calculate the new dynamic price
  const calculatedPrice = `$${calculateProductPrice(product).toFixed(2)}`;

  return (
    <div className="hero-page-layout" style={{ position: 'relative' }}>
      
      {/* Implemented ActionsMenu with the white circle background prop */}
      {/* <ActionsMenu options={menuOptions} withBackground={true} /> */}
      
      <BackButton pushElementsDown={false} showBackground={true}/>
      
      <div className="hero-image-container">
        <Image src={product.image} alt={product.name} containerClass="hero-image-wrapper" imgClass="hero-image" />
      </div>
      
      <div className="hero-content-container">
        <div className="hero-header-group">
          <h2 className="hero-product-title">{product.name}</h2>
          <span className="hero-product-price">{calculatedPrice}</span>
          
          {/* Buyer Message Displayed Here */}
          {product.customMessage && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem', fontStyle: 'italic' }}>
              Mensaje personalizado: "{product.customMessage}"
            </div>
          )}
        </div>

        <div className="customizations-list">
          {product.customizations?.map((cust, index) => (
            <CategoryDetail 
              key={index} 
              category={cust.category} 
              option={cust.option} 
              price={cust.price} 
              showDivider={index < product.customizations.length - 1}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default ProductOrderedDetailPage;
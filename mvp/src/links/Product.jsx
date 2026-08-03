import React, { useEffect } from 'react'; 
import { useParams, useNavigate, useLocation } from 'react-router-dom'; 
import ProductPage from '../components/pages/ProductPage'; 
import { useCart } from '../hooks/useCart'; 
import { useProductDetail } from '../hooks/useProductDetail'; 

const Product = () => {
  const { slug, id } = useParams(); 
  const navigate = useNavigate(); 
  const location = useLocation(); 
  
  const { addToCart, removeFromCart } = useCart(); 
  const editMode = location.state?.editMode;
  const editCartItem = location.state?.cartItem;

  const { data: product, isLoading, error } = useProductDetail(id, slug);

  useEffect(() => {
    window.scrollTo(0, 0); 
  }, [id]); 

  const handleAddToCart = (orderData) => {
    const formattedCustomizations = []; 
    const selectedOptionIds = []; 

    if (orderData.product.customizations) {
      orderData.product.customizations.forEach(cat => {
        const selectedOptionId = orderData.customizations[cat.field]; 
        if (selectedOptionId) {
          const selectedOption = cat.options.find(opt => String(opt.id) === String(selectedOptionId)); 
          if (selectedOption) {
            formattedCustomizations.push({
              label: cat.field,
              value: selectedOption.name,
              modifierPrice: selectedOption.price || 0
            }); 
            selectedOptionIds.push(selectedOptionId); 
          }
        }
      }); 
    }

    const cartItem = {
      productId: orderData.product.id,
      name: orderData.product.name,
      price: orderData.product.price,
      image: orderData.product.image.length > 0 ? orderData.product.image[0] : 'https://via.placeholder.com/150',
      quantity: editMode ? editCartItem.quantity : 1, 
      customizations: formattedCustomizations,
      selectedOptionIds: selectedOptionIds,
      customMessage: orderData.customMessage,
    }; 

    if (editMode && editCartItem) {
      removeFromCart(editCartItem.productId, editCartItem.selectedOptionIds, editCartItem.customMessage);
    }

    addToCart(cartItem); 
    
    // Clear the edit state from history if we were editing
    if (editMode) {
      // 1. Replace the current history entry (Edit Mode) with a clean product page state
      navigate(location.pathname, { replace: true, state: {} });
      
      // 2. Wait a fraction of a second, then push the Cart page onto the history stack
      setTimeout(() => {
        navigate(`/${slug}/cart`); 
      }, 10);
    } else {
      // Normal navigation for brand new items
      navigate(`/${slug}/cart`); 
    }
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Cargando producto...
      </div>
    ); 
  }

  if (error) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#ef4444' }}>
        Error: {error.message}
      </div>
    ); 
  }

  if (!product) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Producto no encontrado.
      </div>
    ); 
  }
  
  return (
    <ProductPage 
      product={product} 
      onAddToCart={handleAddToCart} 
      onBack={-1} 
      initialCartData={editCartItem} 
    />
  ); 
};

export default Product;
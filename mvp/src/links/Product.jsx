import React, { useEffect } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import ProductPage from '../components/pages/ProductPage'; 
import { useCart } from '../hooks/useCart'; 
import { useProductDetail } from '../hooks/useProductDetail'; 

const Product = () => {
  // 1. Extract both 'slug' and 'id' from the URL parameters 
  const { slug, id } = useParams(); 
  const navigate = useNavigate(); 
  const { addToCart } = useCart(); 

  // 2. Destructure data, loading state, and error from TanStack Query
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
      quantity: 1, 
      customizations: formattedCustomizations,
      selectedOptionIds: selectedOptionIds,
      customMessage: orderData.customMessage,
    }; 

    addToCart(cartItem); 
    
    // 2. Navigate dynamically using the captured slug 
    navigate(`/${slug}/cart`); 
  };

  // 3. Fallback loading view if initialData wasn't found in cache
  if (isLoading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Cargando producto...
      </div>
    ); 
  }

  // 4. Safely handle errors
  if (error) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
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
    />
  ); 
};

export default Product; 
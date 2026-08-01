import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductPage from '../components/pages/ProductPage';
import { supabase } from '../client'; 
import { useCart } from '../hooks/useCart'; 

const Product = () => {
  // 1. Extract both 'slug' and 'id' from the URL parameters[cite: 14]
  const { slug, id } = useParams(); 
  const navigate = useNavigate();
  const { addToCart } = useCart(); 

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const { data, error: fetchError } = await supabase
          .from('product')
          .select(`
            id,
            name,
            base_price,
            description,
            stock_quantity,
            store_id,
            product_image (
              image_url
            ),
            customization_category (
              id,
              name,
              is_required,
              customization_option (
                id,
                value,
                price_modifier,
                image_url
              )
            )
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          const mappedProduct = {
            id: data.id,
            name: data.name,
            price: parseFloat(data.base_price) || 0,
            description: data.description,
            amountAvailable: data.stock_quantity,
            image: data.product_image?.map(img => img.image_url) || [],
            customizations: data.customization_category?.map(cat => ({
              id: cat.id,
              field: cat.name,
              required: cat.is_required,
              options: cat.customization_option?.map(opt => ({
                id: opt.id,
                name: opt.value,
                price: parseFloat(opt.price_modifier) || 0,
                image: opt.image_url
              })) || []
            })) || []
          };

          setProduct(mappedProduct);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
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
    
    // 2. Navigate dynamically using the captured slug[cite: 14]
    navigate(`/${slug}/cart`);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading product...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
        Error: {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Product not found.
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
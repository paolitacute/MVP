import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductPage from '../components/pages/ProductPage';
import { supabase } from '../client'; // Adjust path according to your project setup

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        // Fetch the product and its nested customization/image relationships
        const { data, error: fetchError } = await supabase
          .from('product')
          .select(`
            id,
            name,
            base_price,
            description,
            delivery,
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
          // Map the database structure to match the UI prop structure
          const mappedProduct = {
            id: data.id,
            name: data.name,
            price: parseFloat(data.base_price) || 0,
            description: data.description,
            delivery: data.delivery,
            amountAvailable: data.stock_quantity,
            // Extract base product image URLs into an array
            image: data.product_image?.map(img => img.image_url) || [],
            // Map customizations
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
    // In a real app, you would dispatch to a Cart Context or Redux here.
    console.log("Added to cart:", orderData);
    navigate('/cart');
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

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
    
  return (
    <ProductPage 
      product={product} 
      onAddToCart={handleAddToCart} 
      onBack={-1} // Alternatively, you could dynamically query the store slug to route back
    />
  );
};

export default Product;
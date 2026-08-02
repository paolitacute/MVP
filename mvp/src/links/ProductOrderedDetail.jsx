import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductOrderedDetailPage from '../components/pages/ProductOrderedDetailPage';
import NavBar from '../components/NavBar';
import { supabase } from '../client';

const ProductOrderedDetail = () => {
  const { orderId, productId } = useParams();
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoading(true);

        // 1. Fetch the specific order item and its customizations
        const { data: itemData, error: itemError } = await supabase
          .from('order_item')
          .select(`
            id,
            product_id,
            product_name,
            unit_price,
            custom_message, 
            order_item_option (
              category_name,
              option_name,
              additional_price
            )
          `)
          .eq('id', productId)
          .eq('order_id', orderId) // Enforce that this item belongs to the current order
          .single();

        if (itemError) throw itemError;
        if (!itemData) throw new Error('Producto no encontrado en este pedido');

        // 2. Safely fetch the product image if the product_id exists
        let imageUrl = '';
        if (itemData.product_id) {
          const { data: imageData, error: imageError } = await supabase
            .from('product_image')
            .select('image_url')
            .eq('product_id', itemData.product_id)
            .limit(1)
            .maybeSingle();

          if (!imageError && imageData) {
            imageUrl = imageData.image_url;
          }
        }

        // 3. Format the data precisely for ProductOrderedDetailPage
        const formattedProduct = {
          id: itemData.id,
          name: itemData.product_name,
          price: `$${Number(itemData.unit_price).toFixed(2)}`,
          image: imageUrl,
          customMessage: itemData.custom_message,
          customizations: (itemData.order_item_option || []).map(opt => ({
            category: opt.category_name,
            option: opt.option_name,
            price: `$${Number(opt.additional_price).toFixed(2)}`
          }))
        };

        setProduct(formattedProduct);
      } catch (err) {
        console.error('Error fetching ordered product:', err);
        setError('Error al cargar los detalles del producto.');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId && orderId) {
      fetchProductData();
    }
  }, [productId, orderId]);

  if (isLoading) {
    return (
      <>
      </>
      // <div style={{ padding: '2rem', textAlign: 'center' }}>
      //   <p>Cargando detalles del producto...</p>
      //   <NavBar />
      // </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{error || 'Producto no encontrado.'}</p>
        <NavBar />
      </div>
    );
  }

  return (
    <>
      <ProductOrderedDetailPage product={product} />
      <NavBar />
    </>
  );
};

export default ProductOrderedDetail;
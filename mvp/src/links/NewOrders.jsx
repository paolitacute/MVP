import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HorizontalListPage from '../components/pages/HorizontalListPage';
import NavBar from '../components/NavBar';
import { supabase } from '../client';

const NewOrders = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchNewOrders();
  }, []);

  const fetchNewOrders = async () => {
    try {
      setLoading(true);

      // 1. Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError || new Error('No user authenticated');

      // 2. Fetch the store ID associated with this seller
      const { data: storeData, error: storeError } = await supabase
        .from('store')
        .select('id')
        .eq('seller_id', user.id)
        .single();

      if (storeError || !storeData) {
        throw new Error('Store not found for this user');
      }

      const storeId = storeData.id;

      // 3. Fetch Orders (Filter strictly by 'Nueva' using an inner join on order_status)
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          delivery_date,
          completed_at,
          buyer_name,
          buyer_address,
          buyer_phone,
          buyer_email,
          total,
          created_at,
          order_status!inner ( name ),
          order_item (
            id,
            product_name,
            product_id,
            quantity,
            unit_price,
            subtotal
          )
        `)
        .eq('store_id', storeId)
        .eq('order_status.name', 'Nueva') // Adapting to the specific DB nomenclature
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // 4. Extract unique product IDs for safely fetching images decoupled from the main query
      const productIds = [
        ...new Set(
          (ordersData || []).flatMap((order) =>
            order.order_item.map((item) => item.product_id).filter(Boolean)
          )
        )
      ];

      let imagesMap = {};
      if (productIds.length > 0) {
        const { data: imagesData, error: imagesError } = await supabase
          .from('product_image')
          .select('product_id, image_url')
          .in('product_id', productIds);

        if (!imagesError && imagesData) {
          imagesMap = imagesData.reduce((acc, img) => {
            if (!acc[img.product_id]) acc[img.product_id] = img.image_url;
            return acc;
          }, {});
        }
      }

      // Helper for Local Timezone conversion
      const formatLocalYYYYMMDD = (utcDateString) => {
        if (!utcDateString) return null;
        const date = new Date(utcDateString);
        if (isNaN(date)) return utcDateString.split('T')[0];
        
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        
        return `${yyyy}-${mm}-${dd}`;
      };

      // 5. Format data for HorizontalListPage
      const formattedOrders = (ordersData || []).map((order) => {
        const itemCount = order.order_item?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

        const products = (order.order_item || []).map((item) => {
          const imageUrl = item.product_id ? (imagesMap[item.product_id] || '') : '';

          return {
            id: item.id,
            name: item.product_name,
            price: `$${Number(item.unit_price).toFixed(2)}`,
            image: imageUrl,
            customizations: [],
          };
        });

        const sendByDate = order.delivery_date ? formatLocalYYYYMMDD(order.delivery_date) : null;
        const completedDate = order.completed_at ? formatLocalYYYYMMDD(order.completed_at) : null;

        return {
          id: order.id,
          status: order.order_status?.name || 'Nueva',
          itemCount,
          sendByDate,
          completedDate,
          buyer: {
            name: order.buyer_name,
            phone: order.buyer_phone,
            address: order.buyer_address,
            email: order.buyer_email,
          },
          products,
        };
      });

      setOrders(formattedOrders);
    } catch (err) {
      console.error('Error fetching new orders:', err);
      setError('Failed to load new orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (orderId) => {
    navigate(`/${username}/order/${orderId}`);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
         <p>Loading new orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{error}</p>
        <NavBar />
      </div>
    );
  }

  return (
    <div>
      <HorizontalListPage
        title="Nuevas"
        filters={['Nueva']} 
        data={orders}
        onClick={handleCardClick}
      />
      <NavBar />
    </div>
  );
};

export default NewOrders;
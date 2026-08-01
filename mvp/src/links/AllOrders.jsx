import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HorizontalListPage from '../components/pages/HorizontalListPage';
import NavBar from '../components/NavBar';
import { supabase } from '../client';

const AllOrders = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
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

      // 3. Fetch Orders (matching the Home.jsx single query convention)
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
          order_status ( 
            name 
          ),
          order_item (
            id,
            product_name,
            product_id,
            quantity,
            unit_price,
            subtotal,
            product (
              product_image ( 
                image_url 
              )
            )
          )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // 4. Format data for HorizontalListPage
      const formattedOrders = (ordersData || []).map((order) => {
        const itemCount = order.order_item?.reduce((sum, item) => sum + item.quantity, 0) || 0;

        const products = (order.order_item || []).map((item) => {
          const imageUrl = item.product?.product_image?.[0]?.image_url || '';

          return {
            id: item.id,
            name: item.product_name,
            price: `$${Number(item.subtotal).toFixed(2)}`,
            image: imageUrl,
            customizations: [],
          };
        });

        const sendByDate = order.delivery_date ? order.delivery_date.split('T')[0] : null;
        const completedDate = order.completed_at ? order.completed_at.split('T')[0] : null;

        return {
          id: order.id,
          status: order.order_status?.name || 'Unknown',
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
      console.error('Error fetching orders:', err);
      setError('Failed to load orders.');
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
         <p>Loading orders...</p>
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
        title="Orders"
        filters={['Todo', 'Nueva', 'Pendiente', 'En progreso', 'Completada']}
        data={orders}
        onClick={handleCardClick}
      />
      <NavBar />
    </div>
  );
};

export default AllOrders;
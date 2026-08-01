import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrderDetailPage from '../components/pages/OrderDetailPage';
import NavBar from '../components/NavBar';
import { supabase } from '../client';

const mapDBToUIStatus = (dbName) => {
  const name = dbName?.toLowerCase();
  
  if (name === 'completada') return 'completed';
  if (name === 'en progreso') return 'send_by';
  if (name === 'nueva') return 'new';
  if (name === 'cancelado') return 'canceled';
  
  // Defaults to 'pending' for 'Pendiente' or any unknown status
  return 'pending'; 
};

const mapUIToDBStatusName = (uiStatus) => {
  if (uiStatus === 'completed') return 'Completada';
  if (uiStatus === 'send_by') return 'En progreso';
  if (uiStatus === 'new') return 'Nueva';
  if (uiStatus === 'canceled') return 'Cancelado';
  
  // Defaults to 'Pendiente' for 'pending'
  return 'Pendiente';
};

const OrderDetail = () => {
  const { id, username } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [statusMap, setStatusMap] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true);

        const [orderRes, statusRes] = await Promise.all([
          supabase
            .from('orders')
            .select(`
              id,
              created_at,
              delivery_date,
              completed_at,
              total,
              buyer_name,
              buyer_address,
              buyer_phone,
              buyer_email,
              order_status ( id, name ),
              order_item (
                id,
                product_id,
                product_name,
                quantity,    
                unit_price,
                order_item_option (
                  category_name,
                  option_name,
                  additional_price
                )
              )
            `)
            .eq('id', id)
            .single(),
          supabase.from('order_status').select('id, name')
        ]);

        if (orderRes.error) throw orderRes.error;
        if (statusRes.error) throw statusRes.error;

        const orderData = orderRes.data;

        const sMap = {};
        statusRes.data.forEach(s => {
          sMap[s.name] = s.id;
        });
        setStatusMap(sMap);

        const productIds = [
          ...new Set(orderData.order_item.map((item) => item.product_id).filter(Boolean))
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

        // UNROLLING LOGIC: We duplicate the product based on its quantity
        const formattedProducts = [];

        orderData.order_item.forEach(item => {
          const qty = item.quantity || 1;
          
          for (let i = 0; i < qty; i++) {
            formattedProducts.push({
              // Keeping the raw item.id so your React Router navigation to ProductOrderedDetail doesn't break
              id: item.id,
              name: item.product_name,
              price: `$${Number(item.unit_price).toFixed(2)}`,
              image: item.product_id ? (imagesMap[item.product_id] || '') : '',
              customizations: (item.order_item_option || []).map(opt => ({
                category: opt.category_name,
                option: opt.option_name,
                price: `$${Number(opt.additional_price).toFixed(2)}`
              }))
            });
          }
        });

        const uiStatus = mapDBToUIStatus(orderData.order_status?.name);
        const dateOrdered = orderData.created_at ? formatLocalYYYYMMDD(orderData.created_at) : 'N/A';
const dateAction = orderData.completed_at 
  ? formatLocalYYYYMMDD(orderData.completed_at) 
  : (orderData.delivery_date ? formatLocalYYYYMMDD(orderData.delivery_date) : 'N/A');

        setOrder({
          id: orderData.id,
          status: uiStatus,
          dateOrdered,
          dateAction,
          total: orderData.total,
          buyer: {
            name: orderData.buyer_name,
            phone: orderData.buyer_phone,
            address: orderData.buyer_address,
            email: orderData.buyer_email || ''
          },
          products: formattedProducts
        });

      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderData();
    }
  }, [id]);

  const formatLocalYYYYMMDD = (utcDateString) => {
    if (!utcDateString) return null;
    
    const date = new Date(utcDateString);
    
    // Fallback in case the date string is malformed
    if (isNaN(date)) return utcDateString.split('T')[0];
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    
    return `${yyyy}-${mm}-${dd}`;
  };

  const updateStatusInDatabase = async (newUIStatus) => {
    try {
      setIsUpdating(true);
      const targetDbName = mapUIToDBStatusName(newUIStatus);
      const targetDbId = statusMap[targetDbName];

      if (!targetDbId) throw new Error("Target status ID not found in mapping");

      const updatePayload = { status_id: targetDbId };
      
      if (newUIStatus === 'completed') {
        const now = new Date().toISOString();
        updatePayload.completed_at = now;
        
        setOrder(prev => ({
          ...prev,
          status: newUIStatus,
          dateAction: now.split('T')[0]
        }));
      } else {
        updatePayload.completed_at = null;
        setOrder(prev => ({ ...prev, status: newUIStatus }));
      }

      const { error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', order.id);

      if (error) throw error;
      
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
      setShowConfirmModal(false);
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    
    if (newStatus === 'completed') {
      setPendingStatus(newStatus);
      setShowConfirmModal(true);
    } else {
      updateStatusInDatabase(newStatus);
    }
  };

  const confirmCompletion = () => updateStatusInDatabase(pendingStatus);
  const cancelCompletion = () => {
    setShowConfirmModal(false);
    setPendingStatus('');
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading order details...</p>
        <NavBar />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{error || 'Order not found.'}</p>
        <button className="action-button" onClick={() => navigate(`/${username}/all-orders`)}>Go Back</button>
        <NavBar />
      </div>
    );
  }

  return (
    <>
      <OrderDetailPage 
        orderId={order.id} 
        status={order.status}
        dateAction={order.dateAction}
        dateOrdered={order.dateOrdered}
        total={order.total}
        buyer={order.buyer}
        products={order.products}
        onStatusChange={handleStatusChange}
      />

      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'var(--surface-color, #fff)', padding: '2rem',
            borderRadius: '16px', width: '100%', maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', display: 'flex',
            flexDirection: 'column', gap: '1.5rem', textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
              Confirm Completion
            </h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem' }}>
              Are you sure you want to mark this order as completed?
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                className="action-button"
                style={{ backgroundColor: '#f1f5f9', color: 'var(--text-main)' }}
                onClick={cancelCompletion}
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                className="action-button"
                onClick={confirmCompletion}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <NavBar/>
    </>
  );
};

export default OrderDetail;
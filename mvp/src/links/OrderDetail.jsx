import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrderDetailPage from '../components/pages/OrderDetailPage';
import NavBar from '../components/NavBar';
import { useOrderDetail, useUpdateOrderStatus } from '../hooks/useOrderDetail';

const OrderDetail = () => {
  const { id, username } = useParams();
  const navigate = useNavigate();
  
  // 1. Fetch data using useQuery
  const { data, isLoading, error } = useOrderDetail(id);
  
  // 2. Initialize the mutation hook
  const updateStatusMutation = useUpdateOrderStatus();
  
  // 3. Keep local state strictly for UI modals
  const [pendingStatus, setPendingStatus] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    
    if (newStatus === 'completed') {
      setPendingStatus(newStatus);
      setShowConfirmModal(true);
    } else {
      updateStatusMutation.mutate({
        orderId: id,
        newUIStatus: newStatus,
        statusMap: data.statusMap
      }, {
        onError: () => alert('Failed to update status. Please try again.')
      });
    }
  };

  const handleCancelOrder = () => {
      updateStatusMutation.mutate({
        orderId: id,
        newUIStatus: 'canceled',
        statusMap: data.statusMap
      }, {
        onError: () => alert('Failed to cancel order. Please try again.')
      });
  };

  const confirmCompletion = () => {
    updateStatusMutation.mutate({
      orderId: id,
      newUIStatus: pendingStatus,
      statusMap: data.statusMap
    }, {
      onSuccess: () => {
        setShowConfirmModal(false);
        setPendingStatus('');
      },
      onError: (err) => {
        console.error('Error updating status:', err);
        alert('Failed to update status. Please try again.');
        setShowConfirmModal(false);
      }
    });
  };

  const cancelCompletion = () => {
    setShowConfirmModal(false);
    setPendingStatus('');
  };

  if (isLoading) {
    return (
      <>
      </>
      // <div style={{ padding: '2rem', textAlign: 'center' }}>
      //   <p>Cargando detalles del pedido...</p>
      //   <NavBar />
      // </div>
    );
  }

  // data?.order protects against rendering if the fetch failed but didn't throw a hard error
  if (error || !data?.order) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{error?.message || 'Pedido no encontrado.'}</p>
        <button className="action-button" onClick={() => navigate(`/${username}/all-orders`)}>Volver</button>
        <NavBar />
      </div>
    );
  }

  const { order } = data;
  const isUpdating = updateStatusMutation.isPending;

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
        onCancelOrder={handleCancelOrder} 
        
        // Pass these down:
        showConfirmModal={showConfirmModal}
        onConfirmCompletion={confirmCompletion}
        onCancelCompletion={cancelCompletion}
      />

      <NavBar/>
    </>
  );
};

export default OrderDetail;
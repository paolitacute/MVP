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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');

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
    const isConfirmed = window.confirm("¿Estás seguro de que quieres cancelar este pedido?");
    if (isConfirmed) {
      updateStatusMutation.mutate({
        orderId: id,
        newUIStatus: 'canceled',
        statusMap: data.statusMap
      }, {
        onError: () => alert('Failed to cancel order. Please try again.')
      });
    }
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
              Confirmar finalización
            </h3>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1rem' }}>
              ¿Estás seguro de que quieres marcar este pedido como completado?
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                className="action-button"
                style={{ backgroundColor: '#f1f5f9', color: 'var(--text-main)' }}
                onClick={cancelCompletion}
                disabled={isUpdating}
              >
                Cancelar
              </button>
              <button
                className="action-button"
                onClick={confirmCompletion}
                disabled={isUpdating}
              >
                {isUpdating ? 'Actualizando...' : 'Confirmar'}
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
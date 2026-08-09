import React, { useEffect, useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderText from '../HeaderText';
import DetailsLine from '../DetailsLine';
import HorizontalCardLeft from '../HorizontalCardLeft';
import Dropdown from '../Dropdown';
import BuyerInfo from '../BuyerInfo';
import BackButton from '../BackButton';
import ActionsMenu from '../ActionsMenu';

// formatDisplayDate is now a pure helper function without any hooks
const formatDisplayDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-');
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`; 
};

// Helper to calculate a single product's total price including customizations
const calculateProductPrice = (product) => {
  if (!product || !product.price) return 0;
  const basePrice = parseFloat(product.price.replace('$', '')) || 0;
  const customizationsPrice = product.customizations?.reduce((sum, cust) => {
    return sum + (parseFloat(cust.price.replace('$', '')) || 0);
  }, 0) || 0;
  
  return basePrice + customizationsPrice;
};

// Helper to calculate the grand total for the array of products
const calculateOrderPrice = (products) => {
  if (!products || !Array.isArray(products)) return 'RD$0.00';
  const total = products.reduce((sum, product) => {
    return sum + calculateProductPrice(product);
  }, 0) || 0;
  
  return `RD$${Number(total.toFixed(2)).toLocaleString()}`;
};

const OrderDetailPage = ({ 
  orderId, 
  status, 
  dateAction, 
  dateOrdered, 
  total,
  buyer, 
  products,
  onStatusChange,
  onCancelOrder,
  showConfirmModal,         
  onConfirmCompletion,      
  onCancelCompletion
}) => {
  const navigate = useNavigate();
  const { username } = useParams();

  // State for the cancellation confirmation modal
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal states for the result
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Configure ActionsMenu options with the Trash icon and red color
  const menuOptions = [
    {
      label: 'Cancelar pedido',
      icon: <Trash2 size={16} />,
      color: '#ef4444', 
      onClick: () => setShowCancelConfirm(true) // Open local modal instead of direct call
    }
  ];

  const executeCancel = async () => {
    setShowCancelConfirm(false);
    setIsUpdating(true);
    try {
      if (onCancelOrder) {
        await onCancelOrder(); // Awaits the promise from the parent component
      }
      setResultMessage('Pedido cancelado exitosamente.');
      setIsSuccess(true);
      setShowResultModal(true);
    } catch (error) {
      console.error("Error cancelling order:", error);
      setResultMessage('Hubo un error al cancelar el pedido.');
      setIsSuccess(false);
      setShowResultModal(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseResult = () => {
    setShowResultModal(false);
  };

  const renderDynamicStatusHeader = () => {
    switch (status) {
      case 'completed':
        return <h1 className="dynamic-status-header status-completed">Completado el {formatDisplayDate(dateAction)}</h1>;
      case 'pending':
        return <h1 className="dynamic-status-header status-send">Pendiente</h1>;
      case 'send_by':
        return <h1 className="dynamic-status-header status-send">Entregar antes de {formatDisplayDate(dateAction)}</h1>;
      case 'new':
        return <h1 className="dynamic-status-header status-new">Nuevo pedido</h1>;
      case 'canceled':
        return <h1 className="dynamic-status-header" style={{ color: '#ef4444' }}>Cancelado</h1>;
      default:
        return <h1 className="dynamic-status-header">Estado del pedido</h1>;
    }
  };

  const formatCustomizations = (customizations) => {
    if (!customizations || !Array.isArray(customizations)) return '';
    return customizations
      .map(cust => `${cust.category}: ${cust.option}`)
      .join(', ');
  };

  const calculatedTotal = calculateOrderPrice(products);

  return (
    <div className="order-detail-layout">
      {/* Meatballs Actions Menu */}
      <ActionsMenu options={status !== 'canceled' ? menuOptions : undefined} />

      <BackButton />

      {renderDynamicStatusHeader()}

      <div className="divider"></div>

      <div className="order-meta-row">
        <DetailsLine items={[`Pedido realizado el ${formatDisplayDate(dateOrdered)}`, calculatedTotal]} />
        {status !== 'canceled' && (
          <Dropdown 
            value={status}
            onChange={onStatusChange}
            options={[
              { label: 'Estado', value: 'estado' },
              { label: 'Pendiente', value: 'pending' },
              { label: 'En progreso', value: 'send_by' },
              { label: 'Completada', value: 'completed' },
            ]}
          />
        )}
      </div>

      <BuyerInfo 
        name={buyer.name} 
        phone={buyer.phone} 
        address={buyer.address} 
      />

      <div className="summary-button-container">
        {status !== 'canceled' && (
          <button 
          className="secondary-action-btn"
          onClick={() => navigate(`/${username}/order/${orderId}/summary`)}
        >
          Generar Recibo de Orden
        </button>
        )}
      </div>

      <div className="divider"></div>

      <h3 className="items-header">{products.length} {products.length === 1 ? 'artículo' : 'artículos'}</h3>
      
      <div className="items-list">
        {products.map((product) => (
            <div 
              key={product.id} 
              onClick={() => navigate(`/${username}/order/${orderId}/product/${product.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <HorizontalCardLeft 
                imageSrc={product.image}
                title={product.name}
                subtitle={formatCustomizations(product.customizations)}
                status={`RD$${Number(calculateProductPrice(product).toFixed(2)).toLocaleString()}`}
              />
            </div>
        ))}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          zIndex: 3000, padding: '1.5rem'
        }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.25rem' }}>
              ¿Estás seguro de cancelar este pedido?
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Una vez que se cancele el pedido, esta acción es irreversible y no podrás cambiar su estado.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
              <button
                className="tertiary-action-btn"
                style={{ width: '100%' }}
                onClick={() => !isUpdating && executeCancel()}
              >
                {isUpdating ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
              <button
                className="secondary-action-btn"
                style={{ width: '100%' }}
                onClick={() => !isUpdating && setShowCancelConfirm(false)}
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          zIndex: 3000, padding: '1.5rem'
        }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.25rem' }}>
              ¿Deseas marcar este pedido como completado?
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Esto actualizará el estado del pedido y registrará la fecha actual.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
              <button
                className="secondary-action-btn"
                style={{ width: '100%' }}
                onClick={onCancelCompletion}
              >
                Volver
              </button>
              <button
                className="action-button"
                style={{ width: '100%' }}
                onClick={onConfirmCompletion}
              >
                Marcar completada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Status Modal for Cancellation */}
      {showResultModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          zIndex: 3000, padding: '1.5rem'
        }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: isSuccess ? '#10b981' : '#ef4444', fontSize: '1.5rem' }}>
              {isSuccess ? '¡Éxito!' : 'Error'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {resultMessage}
            </p>
            
            <button
                className="action-button"
                style={{ width: '100%' }}
                onClick={handleCloseResult}
              >
                Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage;

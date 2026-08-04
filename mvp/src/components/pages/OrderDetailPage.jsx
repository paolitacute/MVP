import React, { useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react'; // Added Trash2 import
import { useNavigate, useParams } from 'react-router-dom';
import HeaderText from '../HeaderText';
import DetailsLine from '../DetailsLine';
import HorizontalCardLeft from '../HorizontalCardLeft';
import Dropdown from '../Dropdown';
import BuyerInfo from '../BuyerInfo';
import BackButton from '../BackButton';
import ActionsMenu from '../ActionsMenu'; // Updated to import ActionsMenu

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
  
  return `RD$${total.toFixed(2)}`;
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
  onCancelOrder 
}) => {
  const navigate = useNavigate();
  const { username } = useParams(); // Extract the dynamic username from the URL

  // The hook must be at the top level of your component
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Configure ActionsMenu options with the Trash icon and red color
  const menuOptions = [
    {
      label: 'Cancelar pedido',
      icon: <Trash2 size={16} />,
      color: '#ef4444', 
      onClick: onCancelOrder 
    }
  ];

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
      <ActionsMenu options={menuOptions} />

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
              { label: 'Pendiente', value: 'pending' },
              { label: 'En progreso', value: 'send_by' },
              { label: 'Completado', value: 'completed' },
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
          // Dynamically route using the username
          onClick={() => navigate(`/${username}/order/${orderId}/summary`)}
        >
          Generar Recibo de Orden
        </button>
        )}
      </div>

      <div className="divider"></div>

      <h3 className="items-header">{products.length} {products.length == 1 ? 'artículo' : 'artículos'}</h3>
      
      <div className="items-list">
        {products.map((product) => (
            <div 
              key={product.id} 
              // Dynamically route using the username
              onClick={() => navigate(`/${username}/order/${orderId}/product/${product.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <HorizontalCardLeft 
                imageSrc={product.image}
                title={product.name}
                subtitle={formatCustomizations(product.customizations)}
                status={`RD$${calculateProductPrice(product).toFixed(2)}`}
              />
            </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDetailPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderText from '../components/HeaderText';
import Input from '../components/Input';
import ActionButton from '../components/ActionButton';
import Toast from '../components/Toast';
import BackButton from '../components/BackButton';
import { supabase } from '../client';

// Automatically converts UTC database strings to local timezone and formats in Spanish
const formatReceiptDate = (utcDateString) => {
  if (!utcDateString) return '[FechaOrden]';
  const date = new Date(utcDateString);
  
  // Fallback in case of invalid date parse
  if (isNaN(date)) return utcDateString.split('T')[0];
  
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 - 11
  const day = date.getDate();
  
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  return `${day} de ${months[month]}, ${year}`;
};

// Calculates total including customizations AND quantity
const calculateProductPrice = (product) => {
  if (!product || !product.price) return 0;
  const basePrice = parseFloat(product.price.replace('$', '')) || 0;
  const customizationsPrice = product.customizations?.reduce((sum, cust) => {
    return sum + (parseFloat(cust.price.replace('$', '')) || 0);
  }, 0) || 0;
  
  return (basePrice + customizationsPrice) * (product.quantity || 1);
};

// Calculates grand total across all items
const calculateOrderPrice = (products) => {
  if (!products || products.length === 0) return '$0.00';
  const total = products.reduce((sum, product) => {
    return sum + calculateProductPrice(product);
  }, 0) || 0;
  
  return `$${total.toFixed(2)}`;
};

// Formats the text string for the WhatsApp receipt
const formatProductsList = (products) => {
  if (!products || products.length === 0) return '[Sin artículos]';
  
  return products.map(product => {
    const calculatedProductPrice = `$${calculateProductPrice(product).toFixed(2)}`;
    // Prepend quantity if the buyer ordered more than 1 of this item
    const qtyPrefix = product.quantity > 1 ? `${product.quantity}x ` : '';
    
    let itemText = `– ${qtyPrefix}${product.name}: ${calculatedProductPrice}`; 
    
    if (product.customizations && product.customizations.length > 0) {
      const customizationsText = product.customizations.map(cust => 
        `  • ${cust.category}: ${cust.option} (+${cust.price || '$0.00'})` 
      ).join('\n');
      itemText += `\n${customizationsText}`;
    }
    
    return itemText;
  }).join('\n');
};

const OrderSummary = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI States
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryInput, setDeliveryInput] = useState('');
  const [deliveryError, setDeliveryError] = useState(''); 
  const [showToast, setShowToast] = useState(false); 
  const [message, setMessage] = useState(''); 

  useEffect(() => {
    const fetchOrderSummary = async () => {
      try {
        setLoading(true);
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            buyer_address,
            store ( name ),
            order_item (
              product_name,
              unit_price,
              quantity,
              order_item_option (
                category_name,
                option_name,
                additional_price
              )
            )
          `)
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        const formattedProducts = orderData.order_item.map(item => ({
          name: item.product_name,
          price: `$${Number(item.unit_price).toFixed(2)}`,
          quantity: item.quantity || 1,
          customizations: (item.order_item_option || []).map(opt => ({
            category: opt.category_name,
            option: opt.option_name,
            price: `$${Number(opt.additional_price).toFixed(2)}`
          }))
        }));

        setOrderInfo({
          id: orderData.id,
          created_at: orderData.created_at,
          buyer_address: orderData.buyer_address,
          storeName: orderData.store?.name || 'Tu Tienda',
          products: formattedProducts
        });

        // Trigger the delivery modal once data is ready
        setShowDeliveryModal(true);

      } catch (err) {
        console.error('Error fetching order summary:', err);
        setError('Failed to load order data.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderSummary();
    }
  }, [orderId]);

  const handleDeliverySubmit = () => {
    if (!deliveryInput.trim()) {
      setDeliveryError('Please enter a delivery amount.');
      return;
    }

    const cleanInput = deliveryInput.replace(/[^\d.]/g, '');
    const deliveryNum = parseFloat(cleanInput);

    if (isNaN(deliveryNum)) {
      setDeliveryError('Please enter a valid number.');
      return;
    }

    setDeliveryError('');

    // Prepare variables for the receipt
    const storeName = orderInfo.storeName;
    const orderDate = formatReceiptDate(orderInfo.created_at);
    // Shorten the UUID to the first 8 characters for a cleaner receipt number
    const orderNumber = orderInfo.id.substring(0, 8).toUpperCase();
    const subtotalString = calculateOrderPrice(orderInfo.products);
    const productDetails = formatProductsList(orderInfo.products);

    const subtotalNum = parseFloat(subtotalString.replace(/[^\d.]/g, '')) || 0;
    const totalNum = subtotalNum + deliveryNum;

    const formattedDelivery = `$${deliveryNum.toFixed(2)}`;
    const formattedTotal = `$${totalNum.toFixed(2)}`;

    const finalMessage = `Hola! Somos ${storeName}.

Número de Orden: #${orderNumber}
Fecha de orden: ${orderDate}

Detalle de tu orden:
${productDetails}

Subtotal: ${subtotalString}
Costo de Delivery: ${formattedDelivery}
Total a pagar: ${formattedTotal}

Confirma para enviarte método de pago.`;

    setMessage(finalMessage);
    setShowDeliveryModal(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message); 
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err); 
    }
  };

  if (loading) {
    return (
      <div className="order-summary-layout" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading order summary...</p>
      </div>
    );
  }

  if (error || !orderInfo) {
    return (
      <div className="order-summary-layout" style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{error || 'Order not found.'}</p>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="order-summary-layout" style={{ position: 'relative' }}>
      <BackButton />
      
      <div className="summary-content">
        <HeaderText text="Message" />
        
        <Input 
          id="order-message"
          type="textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={20}
          required
        />
      </div>
      
      <div className="footer-action">
         <ActionButton text="Copy" onClick={handleCopy} /> 
      </div>

      {showDeliveryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-main, #ffffff)',
            padding: '2rem',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main, #333)', margin: 0 }}>
              Delivery Details
            </h3>
            
            <div style={{ textAlign: 'left', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: 'var(--text-secondary, #666)' }}>
                Delivery Address:
              </p>
              <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-main, #333)' }}>
                {orderInfo.buyer_address || '[Dirección no disponible]'}
              </p>
            </div>

            <div style={{ textAlign: 'left' }}>
              <Input 
                id="delivery-amount"
                label="Enter Delivery Amount ($)"
                value={deliveryInput}
                onChange={(e) => {
                  setDeliveryInput(e.target.value);
                  setDeliveryError('');
                }}
                required
              />
              {deliveryError && (
                <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '0.5rem 0 0 0' }}>
                  {deliveryError}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
              <button
                className="tertiary-action-btn"
                style={{ width: '100%' }}
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                className="secondary-action-btn"
                style={{ width: '100%' }}
                onClick={handleDeliverySubmit}
              >
                Generate Message
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Toast 
        show={showToast} 
        message="Message copied to clipboard!" 
      />
    </div>
  );
};

export default OrderSummary;
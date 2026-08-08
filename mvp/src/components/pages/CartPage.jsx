import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import HeaderText from '../HeaderText';
import CartProduct from '../CartProduct';
import CartBuyerInfo from '../CartBuyerInfo'; 
import ActionButton from '../ActionButton';
import BackButton from '../BackButton';

const CartPage = ({ 
  cartItems, 
  removeFromCart, 
  updateQuantity, 
  onEditItem,
  handleCheckout, 
  buyerInfo, 
  setBuyerInfo,
  isCheckingOut 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 1. Add state for the empty cart modal
  const [showEmptyCartModal, setShowEmptyCartModal] = useState(false);

  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = item.price || 0; 
    const customizationsTotal = item.customizations?.reduce((sum, cust) => sum + (cust.modifierPrice || 0), 0) || 0;
    return total + ((itemPrice + customizationsTotal) * item.quantity);
  }, 0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onConfirmOrder = async (formData) => {
    await handleCheckout(formData); 
    setIsModalOpen(false); 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '1.5rem', paddingBottom: '3rem' }}>
      <BackButton/>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <HeaderText text="Carrito" />
        <ShoppingCart color="var(--text-main)" size={28} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, marginBottom: '1.5rem' }}>
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <CartProduct 
              key={`${item.productId}-${index}`} 
              product={item} 
              onQuantityChange={(_, newQuantity) => updateQuantity(item.productId, item.selectedOptionIds, item.customMessage, newQuantity)}
              onEdit={() => onEditItem(item)}
              onDelete={() => removeFromCart(item.productId, item.selectedOptionIds, item.customMessage)}
            />
          ))
        ) : (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
            Tu carrito está vacío.
          </p>
        )}
      </div>

      {cartItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem', padding: '1.5rem 0 0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.125rem' }}>
            <span>Subtotal</span>
            <span>RD${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '0.5rem 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Delivery</span>
            <span>Cálculo pendiente</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Total</span>
            <span style={{ textAlign: 'right'}}>Calculado por el vendedor</span>
          </div>
        </div>
      )}

      <div style={{ paddingBottom: '1rem' }}>
        <ActionButton 
          text="Realizar pedido" 
          // 2. Replace alert with setShowEmptyCartModal(true)
          onClick={() => (cartItems.length) > 0 ? setIsModalOpen(true) : setShowEmptyCartModal(true)} 
        />
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          zIndex: 2000, padding: '1.5rem'
        }}>
          <CartBuyerInfo 
            buyerInfo={buyerInfo}
            setBuyerInfo={setBuyerInfo}
            onSubmit={onConfirmOrder} 
            onCancel={() => !isCheckingOut && setIsModalOpen(false)} 
            isCheckingOut={isCheckingOut} 
          />
        </div>
      )}

      {/* 3. New Empty Cart Modal */}
      {showEmptyCartModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          zIndex: 3000, padding: '1.5rem'
        }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.5rem' }}>
              ¡Espera!
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Tu carrito no puede estar vacío al realizar un pedido.
            </p>
            
            <button
                className="secondary-action-btn"
                style={{ width: '100%' }}
                onClick={() => setShowEmptyCartModal(false)}
              >
                Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
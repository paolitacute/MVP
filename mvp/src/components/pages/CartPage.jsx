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
  handleCheckout, 
  buyerInfo, 
  setBuyerInfo 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate the subtotal by summing base prices and customization modifier prices, multiplied by quantity
  const subtotal = cartItems.reduce((total, item) => {
    const itemPrice = item.price || 0; // Ensures fallback if price is missing
    const customizationsTotal = item.customizations?.reduce((sum, cust) => sum + (cust.modifierPrice || 0), 0) || 0;
    return total + ((itemPrice + customizationsTotal) * item.quantity);
  }, 0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onConfirmOrder = async (formData) => {
    setIsModalOpen(false); 
    await handleCheckout(formData); // Triggers the Supabase RPC call from Cart.jsx
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', padding: '1.5rem', paddingBottom: '3rem' }}>
      <BackButton/>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <HeaderText text="Cart" />
        <ShoppingCart color="var(--text-main)" size={28} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, marginBottom: '1.5rem' }}>
        {cartItems.length > 0 ? (
          cartItems.map((item, index) => (
            <CartProduct 
              key={`${item.productId}-${index}`} 
              product={item} 
              onQuantityChange={(_, newQuantity) => updateQuantity(item.productId, item.selectedOptionIds, newQuantity)}
              onEdit={() => console.log('Navigate to edit item')}
              onDelete={() => removeFromCart(item.productId, item.selectedOptionIds)}
            />
          ))
        ) : (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2rem' }}>
            Your cart is empty.
          </p>
        )}
      </div>

      {/* Order Summary Section */}
      {cartItems.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem', padding: '1.5rem 0 0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: 'var(--text-main)', fontSize: '1.125rem' }}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '0.5rem 0' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Delivery</span>
            <span>Pending for calculation</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Total</span>
            <span>Calculated by seller</span>
          </div>
        </div>
      )}

      <div style={{ paddingBottom: '1rem' }}>
        <ActionButton 
          text="Make an order" 
          onClick={() => setIsModalOpen(true)} 
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
            onCancel={() => setIsModalOpen(false)} 
          />
        </div>
      )}
    </div>
  );
};

export default CartPage;
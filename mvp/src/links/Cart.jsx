import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import CartPage from '../components/pages/CartPage';
import { useCart } from '../hooks/useCart';

const Cart = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();

  // Pull 'checkout' and 'isCheckingOut' from the updated hook
  const { cartItems, removeFromCart, updateQuantity, checkout, isCheckingOut } = useCart();

  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');

  const handleEditItem = (item) => {
    navigate(`/${slug}/product/${item.productId}`, { 
      state: { editMode: true, cartItem: item } 
    });
  };

  const handleCheckout = async (formData) => {
    if (cartItems.length === 0) {
      alert("¡Tu carrito está vacío!");
      return;
    }

    try {
      // Execute the TanStack mutation
      await checkout(formData);
      
      // Redirect to the store-specific success page using the slug
      navigate(`/${slug}/order-success`); 
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Hubo un problema al procesar tu pedido. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <CartPage 
      cartItems={cartItems}
      removeFromCart={removeFromCart}
      updateQuantity={updateQuantity}
      onEditItem={handleEditItem} 
      handleCheckout={handleCheckout}
      buyerInfo={{ buyerName, buyerPhone, buyerEmail, buyerAddress }}
      setBuyerInfo={{ setBuyerName, setBuyerPhone, setBuyerEmail, setBuyerAddress }}
      isCheckingOut={isCheckingOut} // Optional: Pass this down to disable the checkout button while loading
    />
  );
};

export default Cart;
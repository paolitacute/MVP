import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import CartPage from '../components/pages/CartPage';
import { useCart } from '../hooks/useCart';
import { supabase } from '../client'; 

const Cart = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();

  const { cartItems, clearCart, removeFromCart, updateQuantity } = useCart();

  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [neededBy, setNeededBy] = useState('');

  // 1. Add this function to handle routing to edit mode
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

    const deliveryDateTimestamp = new Date(`${formData.neededBy}T12:00:00`).toISOString();

    const { error } = await supabase.rpc('checkout', {
      p_cart: {
        buyer: {
          name: formData.name,
          phone: formData.whatsapp,
          email: formData.email,
          address: formData.address,
        },
       deliverydate: deliveryDateTimestamp, 
        items: cartItems.map((ci) => ({
          productid: ci.productId,
          quantity: ci.quantity,
          optionids: ci.selectedOptionIds,
          custommessage: ci.customMessage,
        })),
      },
    });

    if (error) {
      console.error("Error during checkout:", error);
      alert("Hubo un problema al procesar tu pedido. Por favor, inténtalo de nuevo.");
    } else {
      clearCart();
      // Redirect to the store-specific success page using the slug
      navigate(`/${slug}/order-success`); 
    }
  };

  // 4. Pass the data and functions down to CartPage
  return (
    <CartPage 
      cartItems={cartItems}
      removeFromCart={removeFromCart}
      updateQuantity={updateQuantity}
      onEditItem={handleEditItem} // 2. Pass it as a prop
      handleCheckout={handleCheckout}
      buyerInfo={{ buyerName, buyerPhone, buyerEmail, buyerAddress }}
      setBuyerInfo={{ setBuyerName, setBuyerPhone, setBuyerEmail, setBuyerAddress }}
    />
  );
};

export default Cart;
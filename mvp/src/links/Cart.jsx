import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Imported hooks for routing
import CartPage from '../components/pages/CartPage';
import { useCart } from '../hooks/useCart';
import { supabase } from '../client'; 

const Cart = () => {
  // Extract the slug from the URL and set up navigation
  const { slug } = useParams(); 
  const navigate = useNavigate();

  // 1. Bring in the cart state and functions from the custom hook
  const { cartItems, clearCart, removeFromCart, updateQuantity } = useCart();

  // 2. Create state for the buyer information
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [neededBy, setNeededBy] = useState('');

  // 3. Define the checkout function using your Supabase RPC logic
  const handleCheckout = async (formData) => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
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
        })),
      },
    });

    if (error) {
      console.error("Error during checkout:", error);
      alert("There was an issue processing your order. Please try again.");
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
      handleCheckout={handleCheckout}
      buyerInfo={{ buyerName, buyerPhone, buyerEmail, buyerAddress }}
      setBuyerInfo={{ setBuyerName, setBuyerPhone, setBuyerEmail, setBuyerAddress }}
    />
  ); //
};

export default Cart;
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // Imported useParams here
import { ShoppingCart } from 'lucide-react';

const CartButton = () => {
  const navigate = useNavigate();
  const { slug } = useParams(); // Extract the store slug from the current URL

  return (
    <nav className="cart-container">
      <button 
        className="cart-btn" 
        // Dynamically insert the slug into the cart navigation path[cite: 16]
        onClick={() => navigate(`/${slug}/cart`)} 
        aria-label="View Cart"
      >
        <ShoppingCart size={24} />
      </button>
    </nav>
  ); //
};

export default CartButton;
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const CartButton = ({ floating = true }) => {
  const navigate = useNavigate();
  const { slug } = useParams();

  return (
    <nav 
      className="cart-container"
      style={{
        position: floating ? 'fixed' : 'static',
        zIndex: floating ? 1000 : 'auto',
      }}
    >
      <button 
        className="cart-btn" 
        onClick={() => navigate(`/${slug}/cart`)} 
        aria-label="View Cart"
      >
        <ShoppingCart size={24} />
      </button>
    </nav>
  );
};

export default CartButton;
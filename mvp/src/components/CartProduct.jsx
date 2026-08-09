import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Input from './Input';

const CartProduct = ({ product, onQuantityChange, onEdit, onDelete }) => {
  return (
    <div className="product-summary-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
        <div className="product-image-container">
          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div className="product-text-container" style={{ flexGrow: 1 }}>
          <div className='product-main-text-container'>
            <span className="product-main-text">{product.name}</span>
            <span className="product-main-text">RD${Number(product.price.toFixed(2)).toLocaleString()}</span>
          </div>
          {product.customizations?.map((cust, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)', textAlign: 'left' }}>
                {cust.label}: {cust.value}
              </span>
              {cust.modifierPrice > 0 && (
                <span style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>
                  +RD${Number(cust.modifierPrice.toFixed(2)).toLocaleString()}
                </span>
              )}
            </div>
          ))}
          
          {/* Display custom message if it exists */}
          {product.customMessage && (
            <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'left' }}>
              Mensaje: "{product.customMessage}"
            </div>
          )}
        </div>
      </div>
      
      <div className="divider" style={{ margin: '0.75rem 0' }}></div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={onEdit} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '2px solid var(--border-light)', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: 'var(--text-main)' }}
          >
            <Pencil size={18} />
          </button>
          <button 
            onClick={onDelete} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '2px solid var(--border-light)', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: 'var(--text-main)' }}
          >
            <Trash2 size={18} />
          </button>
        </div>
        
        {/* Updated Stepper Input container */}
        <div style={{ width: '140px' }}>
          <Input 
            type="number-stepper"
            id={`quantity-${product.id}`}
            value={product.quantity}
            min={1}
            onChange={(e) => onQuantityChange(product.id, e.target.value)} 
          />
        </div>
      </div>
    </div>
  );
};

export default CartProduct;
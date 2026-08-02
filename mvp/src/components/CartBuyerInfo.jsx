import React, { useState } from 'react';
import Input from './Input';
import ActionButton from './ActionButton';
import HeaderText from './HeaderText';

const CartBuyerInfo = ({ onSubmit, onCancel }) => {
  // 1. Add neededBy to the initial formData state
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    address: '',
    neededBy: '' // <--- ADD THIS
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <HeaderText text="Detalles del pedido" />
      <div className="form-inputs">
        <Input id="name" label="Nombre completo" value={formData.name} onChange={handleChange} required />
        <Input id="whatsapp" label="Número de WhatsApp" value={formData.whatsapp} onChange={handleChange} pattern="[\+]?	?\(?[0-9]{3}\)?-?\s?.?[0-9]{3}\)?-?\s?.?[0-9]{4,6}" required />
        <Input id="email" label="Correo electrónico" type="email" value={formData.email} onChange={handleChange} pattern="[a-z0-9]+@[a-z0-9]+\.[a-z]{2,}" required />
        <Input id="address" label="Dirección de entrega" rows={3} value={formData.address} onChange={handleChange} required />
        
        {/* 2. Add the neededBy Input component */}
        <Input 
          type="datepicker" 
          id="neededBy" 
          label="Fecha para cuando lo necesita" 
          value={formData.neededBy} 
          onChange={handleChange} 
          required 
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button type="button" className="tertiary-action-btn" onClick={onCancel}>
          Cancelar
        </button>
        <button className='secondary-action-btn' style={{width: '100%'}} type="submit" >
          Confirmar pedido
        </button>
      </div>
    </form>
  );
};

export default CartBuyerInfo;
import React, { useState } from 'react';
import Input from './Input';
import ActionButton from './ActionButton';
import HeaderText from './HeaderText';

const sanitizePhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-10);
};

const CartBuyerInfo = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    email: '',
    address: '',
    neededBy: '' 
  });

  const [dateError, setDateError] = useState('');

  const today = new Date().toLocaleDateString('en-CA');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    if (id === 'neededBy') {
      if (value < today) {
        setDateError('La fecha debe ser de al menos hoy.');
      } else {
        setDateError('');
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.neededBy < today) {
      setDateError('La fecha debe ser de al menos hoy.');
      return; 
    }

    setDateError(''); 
    
    const sanitizedData = {
      ...formData,
      whatsapp: sanitizePhone(formData.whatsapp)
    };

    onSubmit(sanitizedData);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <HeaderText text="Detalles del pedido" />
      <div className="form-inputs">
        <Input id="name" label="Nombre completo" value={formData.name} onChange={handleChange} required />
        <Input id="whatsapp" label="Número de WhatsApp" value={formData.whatsapp} onChange={handleChange} pattern="[\+]?\s?\(?[0-9]{3}\)?-?\s?.?[0-9]{3}\)?-?\s?.?[0-9]{4,6}" required />
        <Input id="email" label="Correo electrónico" type="email" value={formData.email} onChange={handleChange} pattern="[a-z0-9]+@[a-z0-9]+\.[a-z]{2,}" required />
        <Input id="address" label="Dirección de entrega" rows={3} value={formData.address} onChange={handleChange} required />
        
        {/* Contenedor para el input y el mensaje de error */}
        <div>
          <Input 
            type="datepicker" 
            id="neededBy" 
            label="Fecha para cuando lo necesita" 
            value={formData.neededBy} 
            onChange={handleChange} 
            min={today}
            required 
          />
          {dateError && (
            <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block', textAlign: 'left' }}>
              {dateError}
            </span>
          )}
        </div>
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
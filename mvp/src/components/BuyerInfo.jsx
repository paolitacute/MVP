import React from 'react';

// Función para formatear el teléfono con guiones
const formatPhoneNumber = (phoneNumberString) => {
  if (!phoneNumberString) return '';
  
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  
  return phoneNumberString;
};

const BuyerInfo = ({ name, phone, address }) => {
  return (
    <div className="buyer-info-container">
      <h3 className="buyer-name">{name}</h3>
      <p className="buyer-detail">{formatPhoneNumber(phone)}</p>
      <p className="buyer-detail">{address}</p>
    </div>
  );
};

export default BuyerInfo;
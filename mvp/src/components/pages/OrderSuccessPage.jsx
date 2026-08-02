import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom'; // Imported useParams here
import ActionButton from '../ActionButton';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams(); // Extract the store slug from the URL

  console.log(slug);

  return (
    <div className="page-container flex-center" style={{ flexDirection: 'column', textAlign: 'center', gap: '2rem', height: '100vh' }}>
      
      {/* Icon Container */}
      <div style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: 'var(--primary-purple)',
        color: 'var(--surface-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 25px rgba(107, 70, 193, 0.2)'
      }}>
        <Check size={64} strokeWidth={3} />
      </div>
      
      {/* Text Group */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
          ¡Orden Confirmada!
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', fontWeight: '500', maxWidth: '280px', margin: '0 auto' }}>
          El vendedor pronto se comunicará contigo a través de tu número de teléfono
        </p>
      </div>

      {/* Return Action */}
      <div style={{ marginTop: '1.5rem', width: '100%', maxWidth: '300px' }}>
        <ActionButton text="Volver a inicio" onClick={() => navigate(`/${slug}`)} /> 
      </div>
      
    </div>
  );
};

export default OrderSuccessPage;
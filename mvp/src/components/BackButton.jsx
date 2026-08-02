import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ goTo = -1 }) => {
  const navigate = useNavigate();

  return (
    <div className="back-button-container">
      <button 
        onClick={() => navigate(goTo)} 
        className="back-button"
        aria-label="Ir atrás"
      >
        <ArrowLeft className='back-button-arrow' size={24} />
      </button>
    </div> 
  );
};

export default BackButton;
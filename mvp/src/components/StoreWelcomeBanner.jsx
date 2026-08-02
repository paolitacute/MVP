import React from 'react';
import Image from './Image';

const StoreWelcomeBanner = ({ storeName, storeLogo }) => {
  return (
    <div className="store-welcome-banner">
    <Image src={storeLogo} alt="Logo" containerClass='store-welcome-logo' imgClass='circle-image logo'/>
        
      <div className="welcome-text-group">
        <span className="welcome-to">Bienvenido a</span>
        <h1 className="store-name-title">{storeName}</h1>
      </div>
    </div>
  );
};

export default StoreWelcomeBanner;
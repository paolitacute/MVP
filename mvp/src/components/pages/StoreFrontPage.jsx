import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreWelcomeBanner from '../StoreWelcomeBanner';
import CartButton from '../CartButton';
import SearchBar from '../SearchBar';
import VerticalCard from '../VerticalCard';

const StoreFrontPage = ({ storeData, listings, slug }) => { 
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleProductClick = (id) => {
    // Navigate with the slug prepended to the URL
    navigate(`/${slug}/product/${id}`); 
  };

  // Filters the dynamic listings based on the search bar input
  const filteredData = listings.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    <nav className="topbar">
        <p style={{fontSize: '0.8rem'}}>¿Tienes una tienda? <a href="https://forms.gle/PwNGzLqzKsvc5wPa6" target="_blank" rel="noopener noreferrer">Regístrala aquí</a></p>
    </nav>
    <CartButton />
    <div className="storefront-container">
      
      <StoreWelcomeBanner 
        storeName={storeData?.name || 'Store'} 
        storeLogo={storeData?.logo} 
        style={{height: '100px'}}
      />
      
      {/* We reuse the spacing classes from list-page-layout, adjusting top padding to fit below the banner */}
      <div style={{ paddingTop: '1.5rem' }}>
        <SearchBar 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />

        {filteredData.length === 0 ? (
          <div className="empty-section-message">
            Nada que ver aquí aún
          </div>
        ) : (
          <div className="cards-grid-container">
            {filteredData.map((item) => (
              <VerticalCard
                key={item.id}
                imageSrc={item.image}
                text1={item.name}
                text2={`RD$${item.price.toFixed(2)}`}
                onClick={() => handleProductClick(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default StoreFrontPage;
import React, { useState, useEffect } from 'react';
import HeaderText from '../HeaderText';
import SearchBar from '../SearchBar';
import VerticalCard from '../VerticalCard';
import BackButton from '../BackButton';

const CardListPage = ({ 
  title, 
  data, 
  onItemClick, 
  onBack = -1,
  emptyMessage = "Nada que ver aquí aún." // Add the prop with a default fallback
}) => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');

  // Filters the listings based on the search bar input
  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <BackButton goTo={onBack}/>

      <div className="section-header">
        <HeaderText text={title} />
      </div>
      
      <SearchBar 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
      />
      
      {/* Conditionally render the grid OR the empty message */}
      {filteredData.length > 0 ? (
        <div className="cards-grid-container">
          {filteredData.map((item) => (
            <VerticalCard
              key={item.id}
              imageSrc={item.image}
              text1={item.name}
              text2={`$${item.price.toFixed(2)}`}
              text3={item.enabled == false ? 'Desactivado' : ''}
              onClick={() => onItemClick(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-section-message" style={{ marginTop: '1.5rem' }}>
          {/* If there's a search term, you might want to dynamically adjust the message */}
          {searchTerm ? `No results found for "${searchTerm}"` : emptyMessage}
        </div>
      )}
    </>
  );
};

export default CardListPage;
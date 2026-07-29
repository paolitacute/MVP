import React, { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VerticalCard from './VerticalCard';

const SectionWithCards = ({ 
  title, 
  viewAllRoute, 
  cards, 
  emptyMessage = "Nothing to see here yet." 
}) => {
  const navigate = useNavigate();
  const { username } = useParams();
  
  // 1. Create a reference for the scrollable container
  const scrollRef = useRef(null);

  // 2. Function to handle the smooth scrolling
  const handleScroll = (direction) => {
    if (scrollRef.current) {
      // Amount of pixels to scroll per click (roughly two cards wide)
      const scrollAmount = 280; 
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Determine if there are cards to display
  const hasCards = cards && cards.length > 0;

  // 3. Format the route safely to prevent double-prefixing 
  // if the parent component already included the username in the prop
  const safeViewAllRoute = viewAllRoute.startsWith(`/${username}`)
    ? viewAllRoute
    : viewAllRoute.startsWith('/') 
      ? `/${username}${viewAllRoute}` 
      : `/${username}/${viewAllRoute}`;

  return (
    <section className="section-with-cards">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <button 
          className="view-all-link" 
          onClick={() => navigate(safeViewAllRoute)}
          aria-label={`View all ${title}`}
        >
          View all
        </button>
      </div>
      
      {/* A relative wrapper to position the absolute arrows */}
      <div className="scroll-wrapper">
        
        {/* Only show left arrow if there are cards */}
        {hasCards && (
          <button 
            type="button"
            className="scroll-arrow left-arrow" 
            onClick={() => handleScroll('left')}
            aria-label="Scroll left"
          >
            &#8592;
          </button>
        )}
        
        {/* The scrollable container */}
        <div className="cards-scroll-container" ref={scrollRef}>
          {hasCards ? (
            cards.map((card, index) => (
              <VerticalCard 
                key={index}
                imageSrc={card.imageSrc}
                text1={card.text1}
                text2={card.text2}
                text3={card.text3}
                onClick={card.onClick}
              />
            ))
          ) : (
            /* Render the empty state if there are no cards */
            <div className="empty-section-message">
              {emptyMessage}
            </div>
          )}
        </div>

        {/* Only show right arrow if there are cards */}
        {hasCards && (
          <button 
            type="button"
            className="scroll-arrow right-arrow" 
            onClick={() => handleScroll('right')}
            aria-label="Scroll right"
          >
            &#8594;
          </button>
        )}
      </div>
    </section>
  );
};

export default SectionWithCards;
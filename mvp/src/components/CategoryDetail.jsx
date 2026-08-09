import React from 'react';

const CategoryDetail = ({ category, option, price, showDivider }) => {
  // Safely parse the price to a number to check its value
  const numericPrice = price ? parseFloat(price.replace('$', '')) : 0;

  return (
    <>
      <div className="category-detail-container">
        <span className="category-label">{category}:</span>
        <span className="category-value">{option}</span>
        
        {/* Only render the price element if the value is greater than zero */}
        {numericPrice > 0 && (
          <span className="category-modifier-price" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            +RD${Number(price.replace('$', '')).toLocaleString()}
          </span>
        )}
      </div>
      {showDivider && <div className="divider" />}
    </>
  );
};

export default CategoryDetail;
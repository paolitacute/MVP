import React from 'react';
import HorizontalCardRight from './HorizontalCardRight';

const CustomizationDetail = ({ title, isRequired, options }) => {
  return (
    <div className="customization-detail-card">
      <div className="customization-header-row">
        <h3 className="customization-title">{title}</h3>
        {isRequired && (
          <span className="badge badge-status badge-status-in-progress" style={{ borderRadius: '9999px' }}>
            Obligatorio
          </span>
        )}
      </div>
      
      <div className="divider"></div>
      
      <div className="customization-options-list">
        {options.map((opt, index) => {
          const numericPrice = parseFloat(opt.price);
          const hasPrice = !isNaN(numericPrice) && numericPrice > 0;

          return (
            <HorizontalCardRight
              key={index}
              title={opt.name}
              subtitle={hasPrice ? `+RD$${opt.price}` : ''}
              imageSrc={opt.image || ''} 
            />
          );
        })}
      </div>
    </div>
  );
};

export default CustomizationDetail;
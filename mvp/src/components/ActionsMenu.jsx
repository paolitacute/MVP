import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';

const ActionsMenu = ({ options = [], withBackground = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the dialog if the user clicks outside of the menu area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Apply specific styles if the icon needs to sit on a colorful background or image
  const containerStyle = withBackground ? { position: 'absolute', top: 0, width: '100%', zIndex: 10 } : {};
  const btnStyle = withBackground 
    ? { 
        backgroundColor: '#ffffff', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)', 
        borderRadius: '50%',
        color: 'var(--text-main, #333)'
      } 
    : {};

  return (
    <header className="transparent-actions-menu" style={containerStyle}>
      <div className="actions-menu-right" ref={menuRef}>
        {/* Meatballs Menu Button */}
        <button 
          className="meatballs-btn" 
          onClick={toggleMenu} 
          aria-label="Menu"
          aria-expanded={isOpen}
          style={btnStyle}
        >
          <MoreHorizontal size={24} />
        </button>
        
        {/* Dropdown Dialog */}
        {isOpen && (
          <div className="meatballs-dialog">
            {options.length > 0 ? (
              options.map((option, index) => (
                <button 
                  key={index} 
                  className="dialog-option"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: option.color || 'var(--text-main, #2d3748)'
                  }}
                  onClick={() => {
                    option.onClick();
                    setIsOpen(false); // Auto-close after action
                  }}
                >
                  {option.icon && option.icon}
                  {option.label}
                </button>
              ))
            ) : (
              <div className="dialog-empty">No options</div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default ActionsMenu;
import React, { useState, useEffect } from 'react';
import Image from './Image';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const ImageCarousel = ({ 
  images = [], 
  containerClass = "carousel-container", 
  imgClass = "carousel-image",
  activeIndex, // Added to accept parent state
  onIndexChange // Added to update parent state
}) => {
  // Initialize with activeIndex if available, otherwise 0
  const [currentIndex, setCurrentIndex] = useState(activeIndex || 0);
  
  // States to track the touch coordinates
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  // The minimum distance (in pixels) to be considered a valid swipe
  const minSwipeDistance = 50;

  // Sync internal state whenever the parent passes a new activeIndex
  useEffect(() => {
    if (activeIndex !== undefined && activeIndex !== currentIndex) {
      setCurrentIndex(activeIndex);
    }
  }, [activeIndex]);

  // Helper to update both local state and parent state
  const handleIndexUpdate = (newIndex) => {
    setCurrentIndex(newIndex);
    if (onIndexChange) {
      onIndexChange(newIndex);
    }
  };

  if (!images || images.length === 0) {
    return (
      <Image 
        src={null} 
        alt="No hay imágenes disponibles" 
        containerClass={containerClass} 
        imgClass={imgClass} 
      />
    );
  }

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    handleIndexUpdate(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    handleIndexUpdate(newIndex);
  };

  // --- Touch Event Handlers ---
  const handleTouchStart = (e) => {
    setTouchEndX(null); 
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext(); 
    }
    
    if (isRightSwipe) {
      goToPrevious(); 
    }
  };

  const currentImage = images[currentIndex];

  const maxVisibleDots = 5;
  let startIdx = 0;
  
  if (images.length > maxVisibleDots) {
    startIdx = Math.max(0, Math.min(currentIndex - Math.floor(maxVisibleDots / 2), images.length - maxVisibleDots));
  }

  const trackTranslation = -(startIdx * 16);

  return (
    <div 
      className={containerClass}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Image 
        src={currentImage} 
        alt={`Slide ${currentIndex + 1}`} 
        containerClass="carousel-image-wrapper" 
        imgClass={imgClass} 
      />
      
      {images.length > 1 && (
        <>
          <button type="button"
            className="carousel-control carousel-prev" 
            onClick={(e) => {
              e.stopPropagation(); 
              goToPrevious();
            }}
            aria-label="Imagen anterior"
          >
            <ArrowLeft size={24} color="var(--text-main, #333)" />
          </button>
          
          <button type="button"
            className="carousel-control carousel-next" 
            onClick={(e) => {
              e.stopPropagation(); 
              goToNext();
            }}
            aria-label="Imagen siguiente"
          >
            <ArrowRight size={24} color="var(--text-main, #333)" />
          </button>

          <div className="carousel-indicators">
            <div className="carousel-dots-window">
              <div 
                className="carousel-dots-track"
                style={{ 
                  transform: `translateX(${trackTranslation}px)`,
                  minWidth: `${(Math.min(images.length, 5) * 16) - 8}px`,
                }}
              >
                {images.map((_, index) => (
                  <span 
                    key={index} 
                    className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleIndexUpdate(index);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageCarousel;
import React, { useEffect } from 'react';
import { Trash2, Pencil, PowerOff } from 'lucide-react';
import HeaderText from '../HeaderText';
import ImageCarousel from '../ImageCarousel';
import CustomizationDetail from '../CustomizationDetail';
import BackButton from '../BackButton';
import ActionsMenu from '../ActionsMenu';

const ListingDetailPage = ({ listing, onEdit, onBack }) => {

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Set up the menu options for the listing including Deactivate listing
  const menuOptions = [
    {
      label: 'Edit listing',
      icon: <Pencil size={16} />,
      onClick: onEdit
    },
    {
      label: 'Deactivate listing',
      icon: <PowerOff size={16} />,
      onClick: () => console.log(`Listing ${listing?.id || ''} deactivated`)
    },
    {
      label: 'Delete listing',
      icon: <Trash2 size={16} />,
      color: '#ef4444', // Red text and icon color
      onClick: () => console.log(`Listing ${listing?.id || 'deleted'} deleted`)
    }
  ];

  if (!listing) return <div className="listing-detail-layout">Loading...</div>;

  // 1. Extract base product images
  let baseImages = [];
  if (Array.isArray(listing.image)) {
    baseImages = [...listing.image];
  } else if (listing.image && typeof listing.image === 'string' && listing.image.trim() !== '') {
    baseImages = [listing.image];
  }

  // 2. Extract customization option images
  const customizationImages = [];
  if (listing.customizations && listing.customizations.length > 0) {
    listing.customizations.forEach((cust) => {
      if (cust.options && cust.options.length > 0) {
        cust.options.forEach((option) => {
          if (option.image && typeof option.image === 'string' && option.image.trim() !== '') {
            customizationImages.push(option.image);
          }
        });
      }
    });
  }

  // 3. Combine both into a single flat array for the carousel
  const images = [...baseImages, ...customizationImages];

  return (
    <>
      <ActionsMenu options={menuOptions} />

        <BackButton goTo={onBack}/>
      
      <div className="listing-detail-layout">

        {/* Render carousel only if we have at least one image from either source */}
        {images.length > 0 && (
          <div className="listing-carousel-section">
            <ImageCarousel images={images} />
          </div>
        )}

        <div className="listing-info-section">
          <h1 className="hero-product-title">{listing.name}</h1>
          <span className="hero-product-price">${listing.price.toFixed(2)}</span>
          
          <div className="listing-meta-row">
            <div className="meta-item">
              <span className="meta-label">Amount available</span>
              <span className="meta-value">{listing.amountAvailable !== null ? listing.amountAvailable : 'Unlimited'}</span>
            </div>
          </div>

          <div className="listing-description">
            <p>{listing.description}</p>
          </div>
        </div>

        {listing.customizations && listing.customizations.length > 0 && (
          <div className="listing-customizations-section">
            <HeaderText text="Customizations" />
            <div className="customizations-list-container">
              {listing.customizations.map((cust) => (
                <CustomizationDetail
                  key={cust.id}
                  title={cust.field}
                  isRequired={cust.required !== undefined ? cust.required : false}
                  options={cust.options}
                />                                                                                              
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ListingDetailPage;
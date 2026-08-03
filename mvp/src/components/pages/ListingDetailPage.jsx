import React, { useEffect, useState } from 'react';
import { Trash2, Pencil, PowerOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { disableProduct, enableProduct, deleteProduct } from '../../utils/productActions';
import HeaderText from '../HeaderText';
import ImageCarousel from '../ImageCarousel';
import CustomizationDetail from '../CustomizationDetail';
import BackButton from '../BackButton';
import ActionsMenu from '../ActionsMenu';

const ListingDetailPage = ({ listing, onEdit, onBack }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!listing) return <div className="listing-detail-layout">Loading...</div>;

  const handlePause = async () => {
    setIsUpdating(true);
    try {
      await disableProduct(listing.id);
      alert('Producto pausado exitosamente.');
      // If you have a refresh function passed as a prop, call it here.
    } catch (error) {
      console.error("Error pausing product:", error);
      alert('Hubo un error al pausar el producto.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReactivate = async () => {
    setIsUpdating(true);
    try {
      await enableProduct(listing.id);
      alert('Producto reactivado exitosamente.');
      // If you have a refresh function passed as a prop, call it here.
    } catch (error) {
      console.error("Error reactivating product:", error);
      alert('Hubo un error al reactivar el producto.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.");
    if (confirmDelete) {
      setIsUpdating(true);
      try {
        await deleteProduct(listing.id);
        alert('Producto eliminado exitosamente.');
        navigate(-1);
      } catch (error) {
        console.error("Error deleting product:", error);
        alert('Hubo un error al eliminar el producto.');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Dynamically set up the menu options
  const menuOptions = [
    {
      label: 'Editar publicación',
      icon: <Pencil size={16} />,
      onClick: onEdit
    }
  ];

  // Check the active state to determine which toggle to show
  if (listing.enabled !== false) {
    menuOptions.push({
      label: isUpdating ? 'Procesando...' : 'Desactivar publicación',
      icon: <PowerOff size={16} />,
      onClick: handlePause
    });
  } else {
    menuOptions.push({
      label: isUpdating ? 'Procesando...' : 'Reactivar publicación',
      icon: <PowerOff size={16} />,
      onClick: handleReactivate
    });
  }

  // Delete is always an option unless we filter deleted items out earlier in the list
  menuOptions.push({
    label: isUpdating ? 'Procesando...' : 'Borrar publicación',
    icon: <Trash2 size={16} />,
    color: '#ef4444',
    onClick: handleDelete
  });

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
      <BackButton goTo={onBack}/>
      
      <div className="listing-detail-layout">
        <ActionsMenu options={menuOptions} />

        {images.length > 0 && (
          <div className="listing-carousel-section">
            <ImageCarousel images={images} />
          </div>
        )}

        <div className="listing-info-section">
          <h1 className="hero-product-title">{listing.name}</h1>
          <span className="hero-product-price">${listing.price.toFixed(2)}</span>
          
          <div className="listing-description">
            <p>{listing.description}</p>
          </div>
        </div>

        {listing.customizations && listing.customizations.length > 0 && (
          <div className="listing-customizations-section">
            <HeaderText text="Personalizaciones" />
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
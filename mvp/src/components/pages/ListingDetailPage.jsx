import React, { useEffect, useState } from 'react';
import { Trash2, Pencil, PowerOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductActions } from '../../hooks/useProductActions';
import HeaderText from '../HeaderText';
import ImageCarousel from '../ImageCarousel';
import CustomizationDetail from '../CustomizationDetail';
import BackButton from '../BackButton';
import ActionsMenu from '../ActionsMenu';
import ActionButton from '../ActionButton'; // Already imported from previous setups

const ListingDetailPage = ({ listing, onEdit, onBack }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Modal states for deleting
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Modal states for toggling enable/disable
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [toggleMessage, setToggleMessage] = useState('');
  const [isToggleSuccess, setIsToggleSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { disableProduct, enableProduct, deleteProduct } = useProductActions();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!listing) return <div className="listing-detail-layout">Loading...</div>;

  const handlePause = async () => {
    setIsUpdating(true);
    try {
      await disableProduct(listing.id);
      setToggleMessage('Producto pausado exitosamente. Los clientes ya no podrán ver este producto en tu tienda.');
      setIsToggleSuccess(true);
      setShowToggleModal(true);
    } catch (error) {
      console.error("Error pausing product:", error);
      setToggleMessage('Hubo un error al pausar el producto.');
      setIsToggleSuccess(false);
      setShowToggleModal(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReactivate = async () => {
    setIsUpdating(true);
    try {
      await enableProduct(listing.id);
      setToggleMessage('Producto reactivado exitosamente. Los clientes ahora podrán ver y comprar este producto.');
      setIsToggleSuccess(true);
      setShowToggleModal(true);
    } catch (error) {
      console.error("Error reactivating product:", error);
      setToggleMessage('Hubo un error al reactivar el producto.');
      setIsToggleSuccess(false);
      setShowToggleModal(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    setShowDeleteConfirm(false);
    setIsUpdating(true);
    try {
      await deleteProduct(listing.id);
      setResultMessage('Producto eliminado exitosamente.');
      setIsSuccess(true);
      setShowResultModal(true);
    } catch (error) {
      console.error("Error deleting product:", error);
      setResultMessage('Hubo un error al eliminar el producto.');
      setIsSuccess(false);
      setShowResultModal(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseResult = () => {
    setShowResultModal(false);
    if (isSuccess) {
      navigate(-1);
    }
  };

  const menuOptions = [
    {
      label: 'Editar',
      icon: <Pencil size={16} />,
      onClick: onEdit
    }
  ];

  if (listing.enabled !== false) {
    menuOptions.push({
      label: isUpdating ? 'Procesando...' : 'Desactivar',
      icon: <PowerOff size={16} />,
      onClick: handlePause
    });
  } else {
    menuOptions.push({
      label: isUpdating ? 'Procesando...' : 'Reactivar',
      icon: <PowerOff size={16} />,
      onClick: handleReactivate
    });
  }

  menuOptions.push({
    label: isUpdating ? 'Procesando...' : 'Borrar',
    icon: <Trash2 size={16} />,
    color: '#ef4444',
    onClick: handleDeleteClick
  });

  let baseImages = [];
  if (Array.isArray(listing.image)) {
    baseImages = [...listing.image];
  } else if (listing.image && typeof listing.image === 'string' && listing.image.trim() !== '') {
    baseImages = [listing.image];
  }

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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          zIndex: 3000, padding: '1.5rem'
        }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1.25rem' }}>
              ¿Estás seguro de eliminar este producto?
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Una vez que se elimine el producto, esta acción es irreversible y ni tú ni los clientes podrán verlo.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
              <button
                className="tertiary-action-btn"
                style={{ width: '100%' }}
                onClick={() => !isUpdating && executeDelete()}
              >
                {isUpdating ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                className="secondary-action-btn"
                style={{ width: '100%' }}
                onClick={() => !isUpdating && setShowDeleteConfirm(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Status Modal for Deletion */}
      {showResultModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          zIndex: 3000, padding: '1.5rem'
        }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: isSuccess ? '#10b981' : '#ef4444', fontSize: '1.5rem' }}>
              {isSuccess ? '¡Éxito!' : 'Error'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {resultMessage}
            </p>
            
            <button
                className="action-button"
                style={{ width: '100%' }}
                onClick={handleCloseResult}
              >
                Aceptar
            </button>
          </div>
        </div>
      )}

      {/* Toggle Status Modal (For Pause/Reactivate) */}
      {showToggleModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          zIndex: 3000, padding: '1.5rem'
        }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: isToggleSuccess ? '#10b981' : '#ef4444', fontSize: '1.5rem' }}>
              {isToggleSuccess ? '¡Éxito!' : 'Error'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {toggleMessage}
            </p>
            
            <button
                className="action-button"
                style={{ width: '100%' }}
                onClick={() => setShowToggleModal(false)}
              >
                Aceptar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ListingDetailPage;
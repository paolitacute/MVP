import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2, Pencil, PowerOff } from 'lucide-react';
import EditButton from '../components/EditButton';
import BackButton from '../components/BackButton';
import HeaderText from '../components/HeaderText';
import CategoryDetail from '../components/CategoryDetail';
import NavBar from '../components/NavBar';
import ActionButton from '../components/ActionButton'; 
import Image from '../components/Image'; 
import ActionsMenu from '../components/ActionsMenu'; 
import { useAccountSettings, useLogout } from '../hooks/useAccountSettings'; 

const AccountSettings = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  const { data, isLoading, error } = useAccountSettings();
  const logoutMutation = useLogout();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const menuOptions = [
      {
        label: 'Editar publicación',
        icon: <Pencil size={16} />,
        onClick: () => navigate(`/${username}/profile/edit`)
      },
      {
        label: 'Desactivar publicación',
        icon: <PowerOff size={16} />,
        onClick: () => console.log(`Listing ${listing?.id || ''} deactivated`)
      },
      {
        label: 'Borrar publicación',
        icon: <Trash2 size={16} />,
        color: '#ef4444', // Red text and icon color
        onClick: () => console.log(`Listing ${listing?.id || 'deleted'} deleted`)
      }
    ];

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/login', { replace: true }); 
    } catch (err) {
      console.error("Unexpected error during logout:", err);
    }
  };

  if (isLoading) {
    return (
      <>
      </>
    );
  }

  if (error) {
    return (
      <div className="page-container flex-center" style={{ paddingBottom: '6rem', color: 'red' }}>
        <p>Error al cargar la cuenta: {error.message}</p>
        <NavBar />
      </div>
    );
  }

  const { seller, store } = data;

  return (
    <>
      <div className="page-container" style={{ paddingBottom: '6rem' }}>
        
        {/* Header Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BackButton goTo={`/${username}/home`}/>
            <HeaderText text="Configuración de la cuenta" />
          </div>
          
          <ActionsMenu options={menuOptions} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
          {/* Section 1: Seller Information */}
          <div className="form-container" style={{ gap: '1rem', padding: '1.5rem', width: '100%', maxWidth: '100%' }}>
            <h3 className="section-subtitle" style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Información del vendedor
            </h3>
            <CategoryDetail category="Nombre" option={seller?.name || 'N/A'} />
            <CategoryDetail category="Correo electrónico" option={seller?.email || 'N/A'} />
            <CategoryDetail category="Teléfono" option={seller?.phone || 'N/A'} />
            <CategoryDetail category="Contraseña" option="********" />
          </div>

          {/* Section 2: Store Information */}
          {store && (
            <div className="form-container" style={{ gap: '1rem', padding: '1.5rem', width: '100%', maxWidth: '100%', marginBottom: '2rem' }}>
              <h3 className="section-subtitle" style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Información de la tienda
              </h3>

              {store.logo && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                  <div style={{ 
                    width: '120px', 
                    height: '120px', 
                    borderRadius: '50%', 
                    overflow: 'hidden', 
                    border: '1px solid var(--border-light)' 
                  }}>
                    <Image 
                      src={store.logo} 
                      alt={`Logo de ${store.name}`} 
                      containerClass="" 
                      imgClass="circle-image logo" 
                    />
                  </div>
                </div>
              )}

              <CategoryDetail category="Nombre de la tienda" option={store.name || 'N/A'} />
              <CategoryDetail category="Slug de la tienda" option={store.slug || 'N/A'} />
              <CategoryDetail category="Teléfono" option={store.phone || 'N/A'} />
              <CategoryDetail category="Correo electrónico" option={store.email || 'N/A'} />
              <CategoryDetail category="Instagram" option={store.instagram || 'N/A'} />
              <CategoryDetail category="Dirección" option={store.address || 'N/A'} />
              <CategoryDetail category="Delivery" option={store.delivery ? 'Sí' : 'No'|| 'N/A'} />
              
              <div style={{ marginTop: '0.5rem' }}>
                  <span className="meta-label">Descripción de la tienda</span>
                  <p className="listing-description">{store.description || 'No se proporcionó descripción.'}</p>
              </div>
            </div>
          )}
          
          {/* Logout Button */}
          <div style={{ marginTop: '1rem' }}>
            <ActionButton 
              text={logoutMutation.isPending ? "Cerrando sesión..." : "Cerrar sesión"} 
              onClick={handleLogout} 
            />
          </div>

        </div>

      </div>

      <NavBar />
    </>
  );
};

export default AccountSettings;
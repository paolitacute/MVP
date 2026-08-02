import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EditButton from '../components/EditButton';
import BackButton from '../components/BackButton';
import HeaderText from '../components/HeaderText';
import CategoryDetail from '../components/CategoryDetail';
import NavBar from '../components/NavBar';
import ActionButton from '../components/ActionButton'; 
import { useAccountSettings, useLogout } from '../hooks/useAccountSettings'; // 1. Import new hooks

const AccountSettings = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  // 2. Destructure data, loading state, and error from TanStack Query
  const { data, isLoading, error } = useAccountSettings();
  const logoutMutation = useLogout();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle the logout sequence
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      
      // Redirect the user back to the login screen
      navigate('/login', { replace: true }); 
    } catch (err) {
      console.error("Unexpected error during logout:", err);
    }
  };

  // 3. Update loading state handling
  if (isLoading) {
    return (
      <>
      </>
      // <div className="page-container flex-center" style={{ paddingBottom: '6rem' }}>
      //   <p>Cargando detalles de la cuenta...</p>
      //   <NavBar />
      // </div>
    );
  }

  // 4. Update error state handling to read error.message
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
          
          {/* Navigation to the edit screen */}
          <EditButton onClick={() => navigate(`/${username}/profile/edit`)} />
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
              <CategoryDetail category="Nombre de la tienda" option={store.name || 'N/A'} />
              <CategoryDetail category="Slug de la tienda" option={store.slug || 'N/A'} />
              <CategoryDetail category="Teléfono" option={store.phone || 'N/A'} />
              <CategoryDetail category="Correo electrónico" option={store.email || 'N/A'} />
              <CategoryDetail category="Instagram" option={store.instagram || 'N/A'} />
              <CategoryDetail category="Dirección" option={store.address || 'N/A'} />
              <CategoryDetail category="Delivery" option={store.delivery ? 'Sí' : 'No'|| 'N/A'} />
              
              {/* Multi-line read-only fields utilizing listing-detail typography */}
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
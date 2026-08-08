import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StoreFrontPage from '../components/pages/StoreFrontPage';
import { useStoreFront } from '../hooks/useStoreFront'; 

const StoreFront = () => {
  // Assuming buyers navigate to something like /store/:slug
  const { slug } = useParams(); 
  const navigate = useNavigate();
  
  // 2. Destructure data, loading state, and error from TanStack Query
  const { data, isLoading, error } = useStoreFront(slug);

  // 3. Update loading state handling to use isLoading
  if (isLoading) {
    return (
      // <>
      // </>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
        <p>Cargando tienda...</p>
      </div>
    );
  }

  // 4. Update error state handling to read error.message
  if (error) {
    return (
      <div className="page-container flex-center" style={{ flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
        <h1 className="header-text-center" style={{ fontSize: '2.5rem' }}>Tienda no encontrada</h1>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '400px' }}>
          El enlace que seguiste parece estar roto o la tienda que buscas no existe.
        </p>
        
        {/* Seller Login Prompt Block */}
        <div style={{ 
          backgroundColor: 'var(--surface-color)', 
          padding: '2rem', 
          borderRadius: '16px', 
          border: '1px solid var(--border-light)', 
          marginTop: '1.5rem',
          width: '100%',
          maxWidth: '350px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}>
          <h2 className="header-text-center" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            ¿Eres un vendedor?
          </h2>
          <button className="action-button" onClick={() => navigate('/login')}>
            Iniciar sesión aquí
          </button>
        </div>
      </div>
    );
  }

  // 5. Pass the formatted data and the slug as props to the presentation component
  // Provide empty objects/arrays as fallbacks to ensure StoreFrontPage doesn't crash on undefined
  return (
    <StoreFrontPage 
      storeData={data?.storeData || {}} 
      listings={data?.listings || []} 
      slug={slug} 
    />
  );
};

export default StoreFront;
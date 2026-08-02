import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ListingDetailPage from '../components/pages/ListingDetailPage';
import NavBar from '../components/NavBar';
import { useListingDetail } from '../hooks/useListingDetail'; // 1. Import the new custom hook

const ListingDetail = () => {
  const { username, id } = useParams();
  const navigate = useNavigate();
  
  // 2. Destructure the data (renamed to listing), loading state, and error
  const { data: listing, isLoading, error } = useListingDetail(id);

  const handleEdit = () => {
    navigate(`/${username}/edit-listing/${id}`);
  };

  // 3. Update to use 'isLoading'
  if (isLoading) {
    return (
      <>
      </>
      // <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      //   <p>Loading listing details...</p>
      // </div>
    );
  }

  // 4. Update to use 'error.message'
  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
        <p>Error cargando la publicación: {error.message}</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Publicación no encontrada.</p>
      </div>
    );
  }

  return (
    <>
      <ListingDetailPage listing={listing} onEdit={handleEdit} onBack={`/${username}/listings`} />
      <NavBar />
    </>
  );
};

export default ListingDetail;
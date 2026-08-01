import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HorizontalListPage from '../components/pages/HorizontalListPage';
import NavBar from '../components/NavBar';
import { useNewOrders } from '../hooks/useNewOrders'; // 1. Import the custom hook

const NewOrders = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  // 2. Destructure data, loading state, and error from TanStack Query
  const { data: orders = [], isLoading, error } = useNewOrders();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCardClick = (orderId) => {
    navigate(`/${username}/order/${orderId}`);
  };

  // 3. Update loading state handling
  if (isLoading) {
    return (
      <>
      </>
      // <div style={{ padding: '2rem', textAlign: 'center' }}>
      //    <p>Loading new orders...</p>
      // </div>
    );
  }

  // 4. Update error state handling to read error.message
  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{error.message || 'Failed to load new orders.'}</p>
        <NavBar />
      </div>
    );
  }

  return (
    <div>
      <HorizontalListPage
        title="Nuevas"
        filters={['Nueva']} 
        data={orders}
        onClick={handleCardClick}
      />
      <NavBar />
    </div>
  );
};

export default NewOrders;
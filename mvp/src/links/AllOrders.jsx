import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HorizontalListPage from '../components/pages/HorizontalListPage';
import NavBar from '../components/NavBar';
import { useOrders } from '../hooks/useOrders'; // 1. Import the custom hook

const AllOrders = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  // 2. Destructure the data, loading state, and error from TanStack Query
  const { data: orders = [], isLoading, error } = useOrders();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCardClick = (orderId) => {
    navigate(`/${username}/order/${orderId}`);
  };

  // 3. Update 'loading' to TanStack's 'isLoading'
  if (isLoading) {
    return (
      <>
      </>
      // <div style={{ padding: '2rem', textAlign: 'center' }}>
      //    <p>Loading orders...</p>
      // </div>
    );
  }

  // 4. Handle the error state returned by TanStack Query
  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{error.message || 'Failed to load orders.'}</p>
        <NavBar />
      </div>
    );
  }

  return (
    <div>
      <HorizontalListPage
        title="Orders"
        filters={['Todo', 'Nueva', 'Pendiente', 'En progreso', 'Completada']}
        data={orders}
        onClick={handleCardClick}
      />
      <NavBar />
    </div>
  );
};

export default AllOrders;
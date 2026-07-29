import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MOCK_ORDERS } from '../data/MockData';
import HorizontalListPage from '../components/pages/HorizontalListPage';
import NavBar from '../components/NavBar';

const NewOrders = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  const handleCardClick = (orderId) => {
    navigate(`/${username}/order/${orderId}`);
  };

  return (
    <div>
      <HorizontalListPage 
        title="New" 
        filters={['New']} 
        data={MOCK_ORDERS}
        onClick={handleCardClick} 
      />

      <NavBar />
    </div>
  );
};

export default NewOrders;
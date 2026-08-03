import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HorizontalListPage from '../components/pages/HorizontalListPage';
import NavBar from '../components/NavBar';
import { useNewOrders } from '../hooks/useNewOrders';
import { supabase } from '../client'; 

const NewOrders = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  const { data: orders = [], isLoading: isOrdersLoading, error: ordersError } = useNewOrders();
  
  const [statuses, setStatuses] = useState([]);
  const [isStatusesLoading, setIsStatusesLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchStatuses = async () => {
      try {
        const { data, error } = await supabase
          .from('order_status')
          .select('id, name')
          .eq('name', 'Nueva'); // Only fetch the ID for the 'Nueva' status
          
        if (error) throw error;
        setStatuses(data || []);
      } catch (err) {
        console.error("Error fetching order statuses:", err);
      } finally {
        setIsStatusesLoading(false);
      }
    };

    fetchStatuses();
  }, []);

  const handleCardClick = (orderId) => {
    navigate(`/${username}/order/${orderId}`);
  };

  if (isOrdersLoading || isStatusesLoading) {
    return (
      <>
      </>
    );
  }

  if (ordersError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{ordersError.message || 'Error al cargar los pedidos.'}</p>
        <NavBar />
      </div>
    );
  }

  // Map the filters dynamically using the Supabase data
  const statusFilters = statuses.map(status => ({
    id: status.id,
    label: status.name
  }));

  // Assign the UUID to the order status
  const mappedOrders = orders.map(order => {
    const matchingStatus = statuses.find(s => s.name === order.status);
    return {
      ...order,
      status: matchingStatus ? matchingStatus.id : order.status
    };
  });

  return (
    <div>
      <HorizontalListPage
        title="Nuevas"
        filters={statusFilters} 
        data={mappedOrders}
        onClick={handleCardClick}
      />
      <NavBar />
    </div>
  );
};

export default NewOrders;
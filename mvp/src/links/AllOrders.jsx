import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import HorizontalListPage from '../components/pages/HorizontalListPage';
import NavBar from '../components/NavBar';
import { useOrders } from '../hooks/useOrders'; 
import { supabase } from '../client'; // 1. Import Supabase client

const AllOrders = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  const { data: orders = [], isLoading: isOrdersLoading, error: ordersError } = useOrders();
  
  // 2. Add state for the statuses fetched from Supabase
  const [statuses, setStatuses] = useState([]);
  const [isStatusesLoading, setIsStatusesLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // 3. Fetch the order statuses from the database
    const fetchStatuses = async () => {
      try {
        const { data, error } = await supabase
          .from('order_status')
          .select('id, name');
          
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

  // Wait for both the orders and the statuses to finish loading
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

  // 4. Build the filter array using the IDs and names directly from Supabase
  const orderFilters = [
    { id: 'all', label: 'Todo' },
    ...statuses.map(status => ({
      id: status.id,
      label: status.name
    }))
  ];

  // 5. Assign the corresponding Supabase status ID to each order 
  // (In case your useOrders hook currently returns the string name instead of the UUID)
  const mappedOrders = orders.map(order => {
    const matchingStatus = statuses.find(s => s.name === order.status);
    return {
      ...order,
      // Overwrite the string status with the UUID from Supabase
      status: matchingStatus ? matchingStatus.id : order.status 
    };
  });

  return (
    <div>
      <HorizontalListPage
        title="Pedidos"
        filters={orderFilters}
        data={mappedOrders}
        onClick={handleCardClick}
      />
      <NavBar />
    </div>
  );
};

export default AllOrders;
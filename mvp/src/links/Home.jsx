import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom'; 
import { useQueryClient } from '@tanstack/react-query'; // Imported to trigger refetches
import SectionWithCards from '../components/SectionWithCards'; 
import NavBar from '../components/NavBar'; 
import { useHomeData } from '../hooks/useHomeData'; 
import { supabase } from '../client'; // Ensure this matches your client path

const Home = () => {
  const navigate = useNavigate(); 
  const { username } = useParams(); 
  const queryClient = useQueryClient(); 
  const [newOrderAlert, setNewOrderAlert] = useState(null); 

  // Retrieve the grouped data from the custom hook
  const { data, isLoading, error } = useHomeData(); 

  // Setup Real-time listener for new orders
  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          // RLS guarantees this is only for this vendor's store
          setNewOrderAlert(payload.new);
          
          // Force React Query to re-fetch the homeData query
          queryClient.invalidateQueries({ queryKey: ['homeData'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []); 

  if (isLoading) {
    return (
      <>
      </>
    ); 
  }

  if (error) {
    return (
      <div className="home-layout">
        <nav className="topbar">
          <p>Error loading dashboard. Please try again.</p>
        </nav>
      </div>
    ); 
  }

  // Attach the navigation onClick handlers to the populated data[cite: 2]
  const newOrders = (data?.newOrders || []).map(order => ({
    ...order,
    onClick: () => navigate(`/${username}/order/${order.id}`)
  })); 

  const allOrders = (data?.allOrders || []).map(order => ({
    ...order,
    onClick: () => navigate(`/${username}/order/${order.id}`)
  })); 

  const listings = (data?.listings || []).map(listing => ({
    ...listing,
    onClick: () => navigate(`/${username}/listing/${listing.id}`)
  })); 

  // Get store slug from hook data (fallback to username if storeSlug isn't explicitly defined)[cite: 2]
  const storeSlug = data?.storeSlug || data?.store?.slug || username; 

  return (
    <div className="home-layout">
      <nav className="topbar">
        <p>¡Hola, {data?.sellerName || 'Vendedor'}!</p>
        <Link 
          to={`/${storeSlug}`} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Ir a mi tienda
        </Link>
      </nav>

      <main className="home-content">
        <div style={{ backgroundColor: '#efe9f7', padding: '0.5rem 0 0 0' }}>
          <SectionWithCards 
            title="Nuevos Pedidos" 
            viewAllRoute={`/${username}/new-orders`} 
            cards={newOrders} 
            emptyMessage="Cuando tengas nuevos pedidos, los verás aquí."
          />
        </div>
        <SectionWithCards 
          title="Todos los Pedidos" 
          viewAllRoute={`/${username}/all-orders`} 
          cards={allOrders} 
          emptyMessage="Cuando tengas nuevos pedidos, los verás aquí."
        />
        <SectionWithCards 
          title="Publicaciones" 
          viewAllRoute={`/${username}/listings`} 
          cards={listings} 
          emptyMessage="Cuando crees publicaciones, las verás aquí."
        />
      </main>

      <NavBar />
    </div>
  ); 
};

export default Home; 
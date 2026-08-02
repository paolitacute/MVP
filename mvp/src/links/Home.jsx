import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SectionWithCards from '../components/SectionWithCards';
import NavBar from '../components/NavBar';
import { useHomeData } from '../hooks/useHomeData';

const Home = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  // Retrieve the grouped data from the custom hook
  const { data, isLoading, error } = useHomeData();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <>
      </>
      // <div className="home-layout">
      //   <nav className="topbar">
      //     <p>Loading your store...</p>
      //   </nav>
      // </div>
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

  // Attach the navigation onClick handlers to the populated data
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

  return (
    <div className="home-layout">
      <nav className="topbar">
        <p>Hola {data?.sellerName || 'Vendedor'}!</p>
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
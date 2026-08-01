import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CardListPage from '../components/pages/CardListPage';
import NavBar from '../components/NavBar';
import { useListings } from '../hooks/useListings'; // 1. Import the custom hook

const Listings = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  
  // 2. Destructure the data, loading state, and error from TanStack Query
  // We default 'listings' to an empty array to prevent undefined mapping before load
  const { data: listings = [], isLoading, error } = useListings();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleItemClick = (id) => {
    navigate(`/${username}/listing/${id}`);
  };

  // 3. Update 'loading' to TanStack's 'isLoading'
  if (isLoading) {
    return (
      <>
      </>
      // <div className='list-page-layout' style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}> 
      //   <p>Loading your catalog...</p>
      //   <NavBar />
      // </div>
    );
  }

  // 4. TanStack Query returns an Error object, so we render error.message
  if (error) {
    return (
      <div className='list-page-layout' style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem', color: 'red' }}> 
        <p>Error loading listings: {error.message}</p>
        <NavBar />
      </div>
    );
  }

  return (
    <div className='list-page-layout'> 
      <CardListPage
        title="Listings"
        data={listings}
        onItemClick={handleItemClick}
        onBack={`/${username}/home`}
      />
      <NavBar />
    </div>
  );
};

export default Listings;
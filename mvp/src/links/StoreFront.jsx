import React from 'react';
import { useParams } from 'react-router-dom';
import StoreFrontPage from '../components/pages/StoreFrontPage';
import { useStoreFront } from '../hooks/useStoreFront'; // 1. Import the custom hook

const StoreFront = () => {
  // Assuming buyers navigate to something like /store/:slug
  const { slug } = useParams(); 
  
  // 2. Destructure data, loading state, and error from TanStack Query
  const { data, isLoading, error } = useStoreFront(slug);

  // 3. Update loading state handling to use isLoading
  if (isLoading) {
    return (
      <>
      </>
      // <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
      //   <p>Loading store...</p>
      // </div>
    );
  }

  // 4. Update error state handling to read error.message
  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem', color: 'red' }}>
        <p>Error loading store: {error.message}</p>
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
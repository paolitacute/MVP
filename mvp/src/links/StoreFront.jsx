import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StoreFrontPage from '../components/pages/StoreFrontPage';
import { supabase } from '../client'; // Adjust path as necessary

const StoreFront = () => {
  // Assuming buyers navigate to something like /store/:slug
  const { slug } = useParams(); 
  
  const [storeData, setStoreData] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStoreAndListings = async () => {
      try {
        setLoading(true);

        // 1. Fetch store details using the URL slug
        const { data: store, error: storeError } = await supabase
          .from('store')
          .select('id, name, logo')
          .eq('slug', slug)
          .single();

        if (storeError) throw storeError;
        if (!store) throw new Error('Store not found');

        setStoreData({
          name: store.name,
          logo: store.logo
        });

        // 2. Fetch published products for this specific store
        const { data: productsData, error: productsError } = await supabase
          .from('product')
          .select(`
            id,
            name,
            base_price,
            product_image (
              image_url
            )
          `)
          .eq('store_id', store.id)
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;

        // 3. Map to the expected UI structure
        const formattedListings = (productsData || []).map((item) => ({
          id: item.id,
          name: item.name,
          price: parseFloat(item.base_price) || 0,
          image: item.product_image?.[0]?.image_url || null,
        }));

        setListings(formattedListings);
      } catch (err) {
        console.error('Error fetching storefront:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStoreAndListings();
    }
  }, [slug]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
        <p>Loading store...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem', color: 'red' }}>
        <p>Error loading store: {error}</p>
      </div>
    );
  }

  // 4. Pass the formatted data and the slug as props to the presentation component
  return <StoreFrontPage storeData={storeData} listings={listings} slug={slug} />; /*[cite: 11] */
};

export default StoreFront;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CardListPage from '../components/pages/CardListPage';
import NavBar from '../components/NavBar';
import { supabase } from '../client'; // Adjust path according to your project setup

const Listings = () => {
  const navigate = useNavigate();
  
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      
      // 1. Authenticate and get user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError || new Error('No user authenticated');

      // 2. Fetch the store ID associated with this seller
      const { data: storeData, error: storeError } = await supabase
        .from('store')
        .select('id')
        .eq('seller_id', user.id)
        .single();

      if (storeError || !storeData) throw storeError || new Error('Store not found');

      // 3. Fetch products and their primary image from the database
      const { data: productsData, error: productsError } = await supabase
        .from('product')
        .select(`
          id,
          name,
          base_price,
          stock_quantity,
          product_image (
            image_url
          )
        `)
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // 4. Map the relational database fields to match CardListPage's expected prop structure
      const formattedListings = (productsData || []).map((listing) => ({
        id: listing.id,
        name: listing.name,
        price: parseFloat(listing.base_price) || 0,
        amountAvailable: listing.stock_quantity,
        // Extract the first image URL from the joined product_image array
        image: listing.product_image?.[0]?.image_url || null, 
      }));

      setListings(formattedListings);
    } catch (err) {
      console.error("Error fetching listings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (id) => {
    navigate(`/listing/${id}`); // Navigates to the ListingDetail page
  };

  if (loading) {
    return (
      <div className='list-page-layout' style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}> 
        <p>Loading your catalog...</p>
        <NavBar />
      </div>
    );
  }

  if (error) {
    return (
      <div className='list-page-layout' style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem', color: 'red' }}> 
        <p>Error loading listings: {error}</p>
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
        onBack="/home"
      />
      <NavBar />
    </div>
  );
};

export default Listings;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ListingDetailPage from '../components/pages/ListingDetailPage';
import NavBar from '../components/NavBar';
import { supabase } from '../client'; // Adjust path according to your project setup

const ListingDetail = () => {
  const { username, id } = useParams();
  const navigate = useNavigate();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch the product and its nested relationships
        const { data, error: fetchError } = await supabase
          .from('product')
          .select(`
            id,
            name,
            base_price,
            delivery,
            stock_quantity,
            description,
            product_image (
              image_url
            ),
            customization_category (
              id,
              name,
              is_required,
              customization_option (
                id,
                value,
                price_modifier,
                image_url
              )
            )
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          // 2. Map the relational database fields to the UI's expected property names
          const mappedListing = {
            id: data.id,
            name: data.name,
            price: parseFloat(data.base_price) || 0,
            delivery: data.delivery,
            amountAvailable: data.stock_quantity,
            description: data.description,
            image: data.product_image?.map(img => img.image_url) || [],
            customizations: data.customization_category?.map(cat => ({
              id: cat.id,
              field: cat.name,
              required: cat.is_required,
              options: cat.customization_option?.map(opt => ({
                id: opt.id,
                name: opt.value,
                price: parseFloat(opt.price_modifier) || 0,
                image: opt.image_url
              })) || []
            })) || []
          };
          
          setListing(mappedListing);
        }
      } catch (err) {
        console.error("Error fetching listing detail:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  const handleEdit = () => {
    navigate(`/${username}/edit-listing/${id}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading listing details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'red' }}>
        <p>Error loading listing: {error}</p>
      </div>
    );
  }

  // Fallback if data is empty but no error was caught
  if (!listing) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Listing not found.</p>
      </div>
    );
  }

  return (
    <>
      <ListingDetailPage listing={listing} onEdit={handleEdit} onBack={`/${username}/listings`} />
      <NavBar />
    </>
  );
};

export default ListingDetail;
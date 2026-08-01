import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModifyListingPage from '../components/pages/ModifyListingPage'; 
import NavBar from '../components/NavBar';
import { supabase } from '../client'; 

// Helper to check if the ID is a valid Postgres UUID
const isValidUUID = (id) => {
  if (!id) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(id.toString());
};

const EditListing = () => {
  const navigate = useNavigate();
  const { username, id } = useParams();

  const [existingProductData, setExistingProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchListingData();
  }, [id]);

  const fetchListingData = async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from('product')
        .select(`
          id,
          name,
          base_price,
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
        const mappedListing = {
          name: data.name,
          price: parseFloat(data.base_price) || 0,
          description: data.description || "",
          amount: data.stock_quantity || "",
          image: data.product_image?.map(img => img.image_url) || [],
          customizations: data.customization_category?.map(cat => ({
            id: cat.id,
            field: cat.name,
            required: cat.is_required,
            options: cat.customization_option?.map(opt => ({
              id: opt.id,
              name: opt.value,
              price: parseFloat(opt.price_modifier) || 0,
              image: opt.image_url || ""
            })) || []
          })) || []
        };
        
        setExistingProductData(mappedListing);
      }
    } catch (err) {
      console.error("Error fetching listing detail:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      // 1. Format the customizations into the exact JSONB structure the RPC expects, stripping temporary frontend IDs
      const formattedCustomizations = (formData.customizations || []).map(cat => ({
        id: isValidUUID(cat.id) ? cat.id : null, 
        field: cat.field,
        required: Boolean(cat.required),
        options: (cat.options || []).map(opt => ({
          id: isValidUUID(opt.id) ? opt.id : null, 
          name: opt.name,
          price: parseFloat(opt.price) || 0,
          image: opt.image || null
        }))
      }));

      // 2. Execute the selective upsert RPC function
      const { error: rpcError } = await supabase.rpc('updateproductfull', {
        p_productid: id,
        p_name: formData.name,
        p_baseprice: parseFloat(formData.price) || 0,
        p_description: formData.description || null,
        p_stockquantity: parseInt(formData.amount, 10) || 0,
        p_customizations: formattedCustomizations
      });

      if (rpcError) throw rpcError;

      // 3. Handle primary product images
      if (formData.image) {
        await supabase.from('product_image').delete().eq('product_id', id);
        
        if (formData.image.length > 0) {
          const imageInserts = formData.image.map(imgUrl => ({
            product_id: id,
            image_url: imgUrl
          }));
          
          const { error: imageError } = await supabase.from('product_image').insert(imageInserts);
          if (imageError) throw imageError;
        }
      }

      // Navigate back to the listing detail page upon successful database update
      navigate(`/${username}/listing/${id}`);

    } catch (err) {
      console.error("Error updating listing:", err);
      alert("Failed to update listing. Please check the console for details.");
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading listing details...</p>
      </div>
    );
  }

  if (error || !existingProductData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' }}>
        <p style={{ color: 'red' }}>Error loading listing: {error || 'Not found'}</p>
        <button onClick={() => navigate(`/${username}/listings`)}>Go Back</button>
      </div>
    );
  }

  return (
    <>
      <ModifyListingPage 
        pageTitle="Edit product"
        buttonText="Save Changes"
        successMessage="Listing updated successfully!"
        initialData={existingProductData}
        onSave={handleUpdate} 
      />

      <NavBar />
    </>
  );
};

export default EditListing;
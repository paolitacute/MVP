import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModifyListingPage from '../components/pages/ModifyListingPage';
import NavBar from '../components/NavBar';
import { supabase } from '../client'; 

const CreateListing = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const navigate = useNavigate();
  const { username } = useParams();

  // The function that interacts with Supabase using the new RPC
  const handleCreateProduct = async (formData) => {
    try {
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
      
      const storeId = storeData.id;

      // 3. Construct the payload variable BEFORE sending it
      const rpcPayload = {
        p_storeid: storeId,
        p_name: formData.name,
        p_baseprice: formData.price,
        p_description: formData.description || null,
        p_delivery: formData.delivery,
        p_stockquantity: formData.amount || 0,
        p_customizations: formData.customizations.map((cust) => ({
          field: cust.field || '', 
          required: cust.required, 
          options: cust.options.map((opt) => ({
            name: opt.name || '',
            price: opt.price || 0,
            image: opt.image || null,
          })),
        })),
      };

      // 4. Log the formatted JSON payload to the console
      //console.log("Outgoing Supabase RPC Payload:", JSON.stringify(rpcPayload, null, 2));

      // 5. Execute the RPC function using the payload variable
      const { error } = await supabase.rpc('createproductfull', rpcPayload);

      if (error) throw error;

      return true; // ModifyListingPage shows the Toast and navigates
    } catch (err) {
      console.error('Error creating listing:', err);
      alert('Failed to create listing. Please try again.');
      return false; // ModifyListingPage does not navigate or show success
    }
  };

  return (
    <>
      <ModifyListingPage 
        pageTitle="Add a product"
        buttonText="Create Listing"
        successMessage="Listing created successfully!"
        onSave={handleCreateProduct} // Pass the updated DB logic down as a prop
        onSubmitSuccess={() => navigate(`/${username}/home`)}
      />
      <NavBar />
    </>
  );
};

export default CreateListing;
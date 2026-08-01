import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModifyListingPage from '../components/pages/ModifyListingPage'; 
import NavBar from '../components/NavBar';
import { useListingDataForEdit, useUpdateListing } from '../hooks/useEditListing'; 
import { 
  uploadProductPhoto, 
  saveProductImageRow, 
  uploadOptionPhoto, 
  saveOptionImageUrl 
} from '../utils/productImages';

const EditListing = () => {
  const navigate = useNavigate();
  const { username, id } = useParams();

  const { data: existingProductData, isLoading, error } = useListingDataForEdit(id);
  const updateListingMutation = useUpdateListing(id);

  useEffect(() => {
    window.scrollTo(0, 0); 
  }, [id]); 

  const handleUpdate = async (formData) => {
    try {
      // Separate images from the form data so they aren't sent to the RPC
      const { productImages, customizations, storeId, ...restData } = formData;
      
      // Clean customizations to remove image Files before sending to DB
      const cleanCustomizations = customizations?.map(cust => ({
        ...cust,
        options: cust.options.map(opt => {
          const { image, ...restOpt } = opt; 
          return restOpt;
        })
      })) || [];

      const dbFormData = {
        ...restData,
        storeId,
        customizations: cleanCustomizations
      };

      // Call updateproductfull via mutation and get the IDs
      const result = await updateListingMutation.mutateAsync(dbFormData);
      
      // We expect the RPC to return { productid, categories: [{ categoryid, optionids }] }
      const { productid, categories } = result;

      // Upload new product images and save their URLs
      if (productImages && productImages.length > 0) {
        for (const file of productImages) {
          if (file instanceof File) {
            const { publicUrl } = await uploadProductPhoto(file, storeId, productid);
            await saveProductImageRow(productid, publicUrl);
          }
        }
      }

      // Upload new customization option images and save their URLs matching by index position
      if (customizations && categories) {
        for (let i = 0; i < customizations.length; i++) {
          const cust = customizations[i];
          const dbCategory = categories[i];
          
          if (cust.options && dbCategory.optionids) {
            for (let j = 0; j < cust.options.length; j++) {
              const opt = cust.options[j];
              const dbOptionId = dbCategory.optionids[j];
              
              if (opt.image instanceof File) {
                const { publicUrl } = await uploadOptionPhoto(opt.image, storeId, productid);
                await saveOptionImageUrl(dbOptionId, publicUrl);
              }
            }
          }
        }
      }
      
      navigate(`/${username}/listing/${id}`); 
    } catch (err) {
      console.error("Error updating listing:", err); 
      alert("Failed to update listing. Please check the console for details."); 
    }
  };

  if (isLoading) {
    return (
      <>
      </>
    ); 
  }

  if (error || !existingProductData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' }}>
        <p style={{ color: 'red' }}>Error loading listing: {error?.message || 'Not found'}</p>
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
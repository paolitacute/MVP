import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModifyListingPage from '../components/pages/ModifyListingPage';
import NavBar from '../components/NavBar';
import { supabase } from '../client'
import { useCreateListing } from '../hooks/useCreateListing'; 
import { 
  uploadProductPhoto, 
  saveProductImageRow, 
  uploadOptionPhoto, 
  saveOptionImageUrl 
} from '../utils/productImages';

const CreateListing = () => {
  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []);
  
  const navigate = useNavigate(); 
  const { username } = useParams(); 
  
  const createListingMutation = useCreateListing();

  const handleCreateProduct = async (formData) => {
    try {
      // 1. Separate images from the form data so they aren't sent to the RPC
      // Fix: Removed storeId from this destructuring since it isn't in formData
      const { productImages, customizations, ...restData } = formData;
      
      // Clean customizations to remove image Files before sending to DB
      const cleanCustomizations = customizations?.map(cust => ({
        ...cust,
        options: cust.options.map(opt => {
          const { image, ...restOpt } = opt; 
          return restOpt;
        })
      })) || [];

      // Fix: Removed storeId from dbFormData; the hook fetches it internally anyway
      const dbFormData = {
        ...restData,
        customizations: cleanCustomizations
      };

      // 2. Call create_product_full via mutation and get the generated IDs
      const result = await createListingMutation.mutateAsync(dbFormData); 
      
      // Fix: Destructure productid and storeId directly from the hook's result
      const { productid, categories, storeId } = result;

      // 3. Upload product images and save their URLs to product_image table
      if (productImages && productImages.length > 0) {
        for (const file of productImages) {
          if (file instanceof File) {
            const { data: { user } } = await supabase.auth.getUser();
            
            // Fix: Pass the properly cased productid
            const { publicUrl } = await uploadProductPhoto(file, storeId, productid);
            await saveProductImageRow(productid, publicUrl);
          }
        }
      }

      // 4. Upload customization option images and save their URLs matching by index position
      if (customizations && categories) {
        for (let i = 0; i < customizations.length; i++) {
          const cust = customizations[i];
          const dbCategory = categories[i];
          
          if (cust.options && dbCategory.optionids) {
            for (let j = 0; j < cust.options.length; j++) {
              const opt = cust.options[j];
              const dbOptionId = dbCategory.optionids[j];
              
              if (opt.image instanceof File) {
                // Fix: Pass the properly cased productid
                const { publicUrl } = await uploadOptionPhoto(opt.image, storeId, productid);
                await saveOptionImageUrl(dbOptionId, publicUrl);
              }
            }
          }
        }
      }

      return true; 
    } catch (err) {
      console.error('Error creating listing:', err); 
      alert('Error al crear la publicación. Por favor, inténtalo de nuevo.'); 
      return false; 
    }
  };

  return (
    <>
      <ModifyListingPage 
        pageTitle="Agregar un producto" 
        buttonText="Crear publicación" 
        successMessage="¡Publicación creada con éxito!" 
        onSave={handleCreateProduct} 
        onSubmitSuccess={() => navigate(`/${username}/home`)} 
      />
      <NavBar /> 
    </>
  );
};

export default CreateListing;
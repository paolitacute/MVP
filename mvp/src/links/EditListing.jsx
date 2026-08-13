import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ModifyListingPage from '../components/pages/ModifyListingPage'; 
import NavBar from '../components/NavBar';
import { useListingDataForEdit, useUpdateListing } from '../hooks/useEditListing'; 
import { 
  uploadProductPhoto, 
  saveProductImageRow, 
  uploadOptionPhoto, 
  saveOptionImageUrl,
  deleteProductImageRow,
  deleteOptionImage
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
      const { productImages, customizations, ...restData } = formData;
      
      const cleanCustomizations = customizations?.map(cust => ({
        ...cust,
        options: cust.options.map(opt => {
          const { image, ...restOpt } = opt; 
          return restOpt;
        })
      })) || [];

      const dbFormData = {
        ...restData,
        customizations: cleanCustomizations
      };

      const result = await updateListingMutation.mutateAsync(dbFormData);
      const { productid, categories } = result;
      const storeId = result.storeId || existingProductData.storeId || existingProductData.store_id;

      // --- 5a. DELETE REMOVED MAIN IMAGES ---
      const originalImages = existingProductData.image || [];
      const keptImageUrls = productImages.filter(img => typeof img === 'string');
      const deletedImageUrls = originalImages.filter(img => !keptImageUrls.includes(img));

      for (const url of deletedImageUrls) {
        await deleteProductImageRow(url);
      }

      // --- 5b. DELETE REMOVED CUSTOMIZATION IMAGES ---
      // Gather all original option images
      const originalOptionImages = [];
      existingProductData.customizations?.forEach(cat => {
        cat.options?.forEach(opt => {
          if (opt.image && typeof opt.image === 'string') {
            originalOptionImages.push(opt.image);
          }
        });
      });

      // Gather all option images that were kept in the submission
      const keptOptionImages = [];
      customizations?.forEach(cat => {
        cat.options?.forEach(opt => {
          if (opt.image && typeof opt.image === 'string') {
            keptOptionImages.push(opt.image);
          }
        });
      });

      // Find the URLs that were removed and delete them
      const deletedOptionImages = originalOptionImages.filter(img => !keptOptionImages.includes(img));

      for (const url of deletedOptionImages) {
        await deleteOptionImage(url);
      }
      // -----------------------------------------------

      // 6. Upload new product images
      if (productImages && productImages.length > 0) {
        for (const file of productImages) {
          if (file instanceof File) {
            const { publicUrl } = await uploadProductPhoto(file, storeId, productid);
            await saveProductImageRow(productid, publicUrl);
          }
        }
      }

      // 7. Upload new customization option images
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
      
      return true; 
    } catch (err) {
      console.error("Error updating listing:", err); 
      alert("Failed to update listing. Please check the console for details."); 
      return false; 
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
        <p style={{ color: 'red' }}>Error al cargar el producto: {error?.message || 'No encontrado'}</p>
        <button onClick={() => navigate(`/${username}/listings`)}>Volver</button>
      </div>
    ); 
  }

  return (
    <>
      <ModifyListingPage 
        pageTitle="Editar producto"
        buttonText="Guardar cambios"
        successMessage="¡Listado actualizado con éxito!"
        initialData={existingProductData}
        onSave={handleUpdate} 
        onSubmitSuccess={() => navigate(`/${username}/listing/${id}`)}
      />

      <NavBar />
    </>
  ); 
};

export default EditListing;
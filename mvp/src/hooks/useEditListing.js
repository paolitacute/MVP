import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';

// Helper to check if the ID is a valid Postgres UUID
const isValidUUID = (id) => {
  if (!id) return false;
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(id.toString());
};

// --- Fetch Hook ---
export const useListingDataForEdit = (id) => {
  return useQuery({
    queryKey: ['listingEdit', id],
    queryFn: async () => {
      const { data, error: fetchError } = await supabase
        .from('product')
        .select(`
          id,
          store_id,
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
        return {
          storeId: data.store_id,
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
      }
      return null;
    },
    enabled: !!id,
    // Force React Query to always fetch fresh data from the database
    refetchOnMount: 'always',
    staleTime: 0,
  });
};

// --- Mutation Hook ---
export const useUpdateListing = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      // 1. Format the customizations into the exact JSONB structure the RPC expects, stripping temporary frontend IDs
      const formattedCustomizations = (formData.customizations || []).map(cat => ({
        id: isValidUUID(cat.id) ? cat.id : null, 
        field: cat.field,
        required: Boolean(cat.required),
        options: (cat.options || []).map(opt => ({
          id: isValidUUID(opt.id) ? opt.id : null, 
          name: opt.name,
          price: parseFloat(opt.price) || 0
        })) // Images are stripped out here since they are handled after the RPC
      })); 

      // 2. Execute the selective upsert RPC function and capture its response data
      const { data, error: rpcError } = await supabase.rpc('updateproductfull', {
        p_productid: id,
        p_name: formData.name,
        p_baseprice: parseFloat(formData.price) || 0,
        p_description: formData.description || null,
        p_stockquantity: null, // parseInt(formData.amount, 10) || 0,
        p_customizations: formattedCustomizations
      }); 

      if (rpcError) throw rpcError;

      // 3. Normalize the RPC response to guarantee the structure expected by EditListing.jsx
      let productid = id;
      let categories = [];

      if (data && typeof data === 'object') {
        productid = data.productid || data.product_id || data.id || id;
        categories = data.categories || data.category || [];
      }
      
      // Return the exact structure needed for the image uploads
      return {
        productid,
        categories
      };
    },
    onSuccess: () => {
      // Invalidate the specific item and the whole list to ensure freshness
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listingEdit', id] });
    }
  });
};
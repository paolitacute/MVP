import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';

// Helper to check if the ID is a valid Postgres UUID[cite: 12]
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
  });
};

// --- Mutation Hook ---
export const useUpdateListing = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      // 1. Format the customizations into the exact JSONB structure the RPC expects, stripping temporary frontend IDs[cite: 12]
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

      // 3. Handle primary product images[cite: 12]
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
      
      return true;
    },
    onSuccess: () => {
      // Invalidate the specific item and the whole list to ensure freshness
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listingEdit', id] });
    }
  });
};
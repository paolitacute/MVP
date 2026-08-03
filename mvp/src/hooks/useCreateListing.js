import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';

export const useCreateListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
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

      // 3. Clean customizations to remove image Files before sending to DB
      const cleanCustomizations = formData.customizations?.map(cust => ({
        ...cust,
        options: cust.options.map(opt => {
          const { image, ...restOpt } = opt; 
          return restOpt;
        })
      })) || [];

     const rpcPayload = {
        p_storeid: storeId,
        p_name: formData.name,
        p_baseprice: formData.price,
        p_description: formData.description || null,
        p_stockquantity: null, // formData.amount || 0,
        p_customizations: cleanCustomizations,
      };

      // 5. Execute the RPC function and capture its response data
      const { data, error } = await supabase.rpc('createproductfull', rpcPayload);

      if (error) throw error;
      
      // 6. Normalize the RPC response to guarantee the structure
      let productid = null;
      let categories = [];

      // If the RPC returns a raw string (e.g., just the UUID)
      if (typeof data === 'string') {
        productid = data;
      } 
      // If the RPC returns an object (e.g., { product_id: '...', categories: [...] })
      else if (data && typeof data === 'object') {
        productid = data.productid || data.product_id || data.id;
        categories = data.categories || data.category || [];
      }
      
      // Return the explicitly structured object the component expects
      return {
        productid,
        categories,
        storeId
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    }
  });
};
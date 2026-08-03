import { useQuery } from '@tanstack/react-query';
import { supabase } from '../client'; 

export const useListings = () => {
  return useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
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
          enabled,
          product_image (
            image_url
          )
        `)
        .eq('store_id', storeData.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // 4. Map the relational database fields to match CardListPage's expected prop structure
      return (productsData || []).map((listing) => ({
        id: listing.id,
        name: listing.name,
        price: parseFloat(listing.base_price) || 0,
        amountAvailable: listing.stock_quantity,
        enabled: listing.enabled,
        image: listing.product_image?.[0]?.image_url || null, 
      }));
    }
  });
};
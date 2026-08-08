import { useQuery } from '@tanstack/react-query';
import { supabase } from '../client';

export const useStoreFront = (slug) => {
  return useQuery({
    queryKey: ['storeFront', slug],
    queryFn: async () => {
      // 1. Fetch store details using the URL slug
      const { data: store, error: storeError } = await supabase
        .from('store')
        .select('id, name, logo, delivery')
        .eq('slug', slug)
        .maybeSingle();

      if (storeError) throw storeError;
      if (!store) throw new Error('Store not found');

      const storeData = {
        name: store.name,
        logo: store.logo,
      };

      // 2. Fetch published products for this specific store
      const { data: productsData, error: productsError } = await supabase
        .from('product')
        .select(`
          id,
          name,
          base_price,
          product_image (
            image_url
          )
        `)
        .eq('store_id', store.id)
        .eq('enabled', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // 3. Map to the expected UI structure
      const listings = (productsData || []).map((item) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.base_price) || 0,
        image: item.product_image?.[0]?.image_url || null,
      }));

      return { storeData, listings };
    },
    // Only execute the query if the slug is available
    enabled: !!slug,
    retry: false,
  });
};
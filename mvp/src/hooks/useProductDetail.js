import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client';

export const useProductDetail = (id, slug) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error: fetchError } = await supabase
        .from('product')
        .select(`
          id,
          name,
          base_price,
          description,
          stock_quantity,
          store_id (delivery),
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

      return {
        id: data.id,
        name: data.name,
        price: parseFloat(data.base_price) || 0,
        description: data.description,
        amountAvailable: data.stock_quantity,
        image: data.product_image?.map(img => img.image_url) || [],
        delivery: data.store_id.delivery,
        customizations: data.customization_category?.map(cat => ({
          id: cat.id,
          field: cat.name,
          required: cat.is_required,
          options: cat.customization_option?.map(opt => ({
            id: opt.id,
            name: opt.value,
            price: parseFloat(opt.price_modifier) || 0,
            image: opt.image_url
          })) || []
        })) || []
      }; 
    },
    enabled: !!id,
    
    // 1. Provide placeholder data from the main StoreFront cache
    initialData: () => {
      if (!slug) return undefined;

      // Look for the storefront catalog in the cache
      const storeFrontData = queryClient.getQueryData(['storeFront', slug]);
      
      if (storeFrontData && storeFrontData.listings) {
        const partialProduct = storeFrontData.listings.find(p => p.id === id);
        
        if (partialProduct) {
          return {
            id: partialProduct.id,
            name: partialProduct.name,
            price: partialProduct.price,
            delivery: partialProduct.delivery,
            description: '', 
            amountAvailable: 0,
            image: partialProduct.image ? [partialProduct.image] : [],
            customizations: []
          };
        }
      }
      return undefined;
    },
    
    // 2. Treat the initial data as instantly stale to trigger a silent background refetch
    initialDataUpdatedAt: 0,
  });
};
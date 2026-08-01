import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../client'; 

export const useListingDetail = (id) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['listing', id],
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

      return {
        id: data.id,
        name: data.name,
        price: parseFloat(data.base_price) || 0,
        amountAvailable: data.stock_quantity,
        description: data.description || '',
        image: data.product_image?.map(img => img.image_url) || [],
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
    
    // 1. Provide placeholder data from the main list cache
    initialData: () => {
      // Look for the product in the existing 'listings' cache
      const listings = queryClient.getQueryData(['listings']);
      
      if (listings) {
        const partialListing = listings.find((item) => item.id === id);
        
        if (partialListing) {
          // Return the partial data formatted to match the detail page's expectations
          return {
            id: partialListing.id,
            name: partialListing.name,
            price: partialListing.price,
            amountAvailable: partialListing.amountAvailable,
            // Provide safe defaults for nested data that hasn't been fetched yet
            description: 'Loading details...', 
            image: partialListing.image ? [partialListing.image] : [], 
            customizations: [] 
          };
        }
      }
      
      // Return undefined if not found so the hook proceeds to show standard loading state
      return undefined;
    },
    
    // 2. Treat the initial data as instantly "stale" so it triggers a background refetch
    // to grab the real description and customizations without showing a loading spinner.
    initialDataUpdatedAt: 0,
  });
};
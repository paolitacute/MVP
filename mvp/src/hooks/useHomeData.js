import { useQuery } from '@tanstack/react-query';
import { supabase } from '../client';

export const useHomeData = () => {
  return useQuery({
    queryKey: ['homeData'],
    queryFn: async () => {
      // 1. Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError || new Error('No user authenticated');

      // 2. Fetch seller details and their store ID + slug
      const { data: sellerData, error: sellerError } = await supabase
        .from('seller')
        .select('name')
        .eq('id', user.id)
        .single();

      if (sellerError) throw sellerError;
      const sellerName = sellerData?.name || 'Seller';

      const { data: storeData, error: storeError } = await supabase
        .from('store')
        .select('id, slug') // <-- Added slug here
        .eq('seller_id', user.id)
        .single();

      // Return early if user has no associated store yet
      if (storeError || !storeData) {
        return { sellerName, storeSlug: null, allOrders: [], newOrders: [], listings: [] }; 
      }

      const storeId = storeData.id;
      const storeSlug = storeData.slug; // <-- Extracted storeSlug

      // 3. Fetch Orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total,
          buyer_name,
          created_at,
          order_status (
            name
          ),
          order_item (
            product_name,
            product_id
          )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // 4. Extract unique product IDs to fetch order thumbnails safely
      const productIds = [
        ...new Set(
          (ordersData || []).flatMap((order) =>
            order.order_item.map((item) => item.product_id).filter(Boolean)
          )
        )
      ];

      let imagesMap = {};
      if (productIds.length > 0) {
        const { data: imagesData, error: imagesError } = await supabase
          .from('product_image')
          .select('product_id, image_url')
          .in('product_id', productIds);

        if (!imagesError && imagesData) {
          imagesMap = imagesData.reduce((acc, img) => {
            if (!acc[img.product_id]) acc[img.product_id] = img.image_url;
            return acc;
          }, {});
        }
      }

      // 5. Fetch Product Listings
      const { data: productsData, error: productsError } = await supabase
        .from('product')
        .select(`
          id,
          name,
          base_price,
          stock_quantity,
          enabled,
          product_image (
            image_url
          )
        `)
        .eq('store_id', storeId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // --- Data Formatting Helpers ---

      // Map raw SQL orders into card structures
      const formattedOrders = (ordersData || []).map((order) => {
        const firstItem = order.order_item?.[0];
        const itemImage = firstItem?.product_id ? (imagesMap[firstItem.product_id] || null) : null;
        const totalAmount = parseFloat(order.total) || 0;

        return {
          id: order.id,
          status: order.order_status?.name,
          imageSrc: itemImage,
          text1: firstItem?.product_name || 'Order Details',
          text2: order.buyer_name,
          text3: `RD$${totalAmount.toFixed(2)}`,
        };
      });

      // Filter "New" orders specifically by matching the exact Spanish database status
      const formattedNewOrders = formattedOrders.filter(
        (order) => order.status?.toLowerCase() === 'nueva'
      );

      // Map product listings into card structures
      const formattedListings = (productsData || []).map((listing) => {
        const price = parseFloat(listing.base_price) || 0;
        const mainImage = listing.product_image?.[0]?.image_url || null;

        return {
          id: listing.id,
          imageSrc: mainImage,
          text1: listing.name,
          text2: `RD$${price.toFixed(2)}`,
          text3: listing.enabled == false ? 'Desactivado' : ''
        };
      });

      return {
        sellerName,
        storeSlug, 
        allOrders: formattedOrders,
        newOrders: formattedNewOrders,
        listings: formattedListings
      };
    }
  });
};
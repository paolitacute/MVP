import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SectionWithCards from '../components/SectionWithCards';
import NavBar from '../components/NavBar';
import { supabase } from '../client';

const Home = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  const [sellerName, setSellerName] = useState('');
  const [newOrders, setNewOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);

      // 1. Get current authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError || new Error('No user authenticated');

      // 2. Fetch seller details and their store ID
      const { data: sellerData, error: sellerError } = await supabase
        .from('seller')
        .select('name')
        .eq('id', user.id)
        .single();

      if (sellerError) throw sellerError;
      setSellerName(sellerData?.name || 'Seller');

      const { data: storeData, error: storeError } = await supabase
        .from('store')
        .select('id')
        .eq('seller_id', user.id)
        .single();

      if (storeError || !storeData) return; // Exit if user has no associated store yet

      const storeId = storeData.id;

      // 3. Fetch Orders (avoiding deep nested joins on nullable product_id)
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

      // 5. Fetch Product Listings (Safe nested query because product_id is NOT NULL in product_image)
      const { data: productsData, error: productsError } = await supabase
        .from('product')
        .select(`
          id,
          name,
          base_price,
          stock_quantity,
          product_image (
            image_url
          )
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // --- Data Formatting Helpers ---

      // Map raw SQL orders into card structures
      const formattedOrders = (ordersData || []).map((order) => {
        const firstItem = order.order_item?.[0];
        
        // Attach image from the secondary mapped query
        const itemImage = firstItem?.product_id ? (imagesMap[firstItem.product_id] || null) : null;
        const totalAmount = parseFloat(order.total) || 0;

        return {
          id: order.id,
          status: order.order_status?.name,
          imageSrc: itemImage,
          text1: firstItem?.product_name || 'Order Details',
          text2: order.buyer_name,
          text3: `$${totalAmount.toFixed(2)}`,
          onClick: () => navigate(`/${username}/order/${order.id}`)
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
          text2: `$${price.toFixed(2)}`,
          text3:
            listing.stock_quantity !== null && listing.stock_quantity > 0
              ? `${listing.stock_quantity} in stock`
              : 'Made to order',
          onClick: () => navigate(`/${username}/listing/${listing.id}`)
        };
      });

      // Set State
      setAllOrders(formattedOrders);
      setNewOrders(formattedNewOrders);
      setListings(formattedListings);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="home-layout">
        <nav className="topbar">
          <p>Loading your store...</p>
        </nav>
      </div>
    );
  }

  return (
    <div className="home-layout">
      <nav className="topbar">
        <p>Hello {sellerName}!</p>
      </nav>

      <main className="home-content">
        <div style={{ backgroundColor: '#efe9f7', padding: '0.5rem 0 0 0' }}>
          <SectionWithCards 
            title="New" 
            viewAllRoute={`/${username}/new-orders`} 
            cards={newOrders} 
            emptyMessage="When you get new orders, you'll see them here."
          />
        </div>
        <SectionWithCards 
          title="Orders" 
          viewAllRoute={`/${username}/all-orders`} 
          cards={allOrders} 
          emptyMessage="When you get new orders, you'll see them here."
        />
        <SectionWithCards 
          title="Listings" 
          viewAllRoute={`/${username}/listings`} 
          cards={listings} 
          emptyMessage="When you create listings, you'll see them here."
        />
      </main>

      <NavBar />
    </div>
  );
};

export default Home;
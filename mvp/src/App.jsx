import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './client'; 
import Login from './links/Login';
import Home from './links/Home';
import CreateSeller from './links/CreateSeller';
import CreateStore from './links/CreateStore';
import AllOrders from './links/AllOrders';
import NewOrders from './links/NewOrders';
import OrderDetail from './links/OrderDetail'; 
import ProductOrderedDetail from './links/ProductOrderedDetail';
import OrderSummary from './links/OrderSummary';
import CreateListing from './links/CreateListing';
import Listings from './links/Listings';
import ListingDetail from './links/ListingDetail';
import AccountSettings from './links/AccountSettings';
import EditAccountSettings from './links/EditAccountSettings';
import EditListing from './links/EditListing';
import StoreFront from './links/StoreFront';
import Product from './links/Product';
import Cart from './links/Cart';
import OrderSuccess from './links/OrderSuccess';
import './App.css';
import './index.css';

// 1. Create the Route Guard Component
const AuthGuard = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  // Determine if the current path is intended for a buyer
  const isBuyerRoute = 
    path.split('/')[2] === 'product' || 
    path.endsWith('/cart') || 
    path.endsWith('/order-success') ||
    (path.split('/').length === 2 && !['', 'login', 'create-seller', 'create-store'].includes(path.split('/')[1]));

  const [authStatus, setAuthStatus] = useState('loading'); 
  const [username, setUsername] = useState(''); 

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        if (isMounted) setAuthStatus('unauth');
        return;
      }

      // 1. Fetch the store's slug directly to use as the URL prefix
      const { data: stores } = await supabase
        .from('store') 
        .select('id, slug') 
        .eq('seller_id', session.user.id) 
        .limit(1);

      if (isMounted) {
         if (stores && stores.length > 0) {
           // 2. Set the URL parameter to the store's slug instead of the seller's name
           setUsername(stores[0].slug); 
           setAuthStatus('has_store');
         } else {
           setAuthStatus('no_store');
         }
      }
    };

    checkStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkStatus();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Bypass auth checks and loading screens for buyers
  if (isBuyerRoute) {
    return children;
  }

  // Show a loading screen while verifying the database state for sellers
  if (authStatus === 'loading') {
    return <div className="page-container flex-center"></div>; 
  }

  const isPublicRoute = path === '/login' || path === '/create-seller';
  const isCreateStoreRoute = path === '/create-store';

  if (authStatus === 'unauth' && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  if (authStatus !== 'unauth' && isPublicRoute) {
     return <Navigate to={authStatus === 'has_store' ? `/${username}/home` : '/create-store'} replace />;
  }

  if (authStatus === 'no_store' && !isCreateStoreRoute) {
    return <Navigate to="/create-store" replace />;
  }

  if (authStatus === 'has_store' && isCreateStoreRoute) {
    return <Navigate to={`/${username}/home`} replace />;
  }

  // --- NEW ENFORCEMENT: URL Ownership Check ---
  // If a seller is logged in, ensure they can only access their own parameterized routes
  if (authStatus === 'has_store' && !isPublicRoute && !isCreateStoreRoute) {
    // Extract the username currently in the browser's URL
    const urlUsername = path.split('/')[1];

    // If it doesn't match their actual authenticated username
    if (urlUsername !== username) {
      // Extract the rest of the path (e.g., "/home" or "/new-orders") 
      const remainingPath = path.substring(urlUsername.length + 1);
      
      // Forcefully seamlessly redirect them to their own version of the page
      return <Navigate to={`/${username}${remainingPath}`} replace />;
    }
  }

  // If the user passes all rule checks, render the page they requested
  return children;
};

// 2. Wrap the Routes in the App Component
const App = () => {
  return (
    <Router>
      <AuthGuard>
        <Routes>
          {/* Core Auth & Flow Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/create-seller" element={<CreateSeller />} />
          <Route path="/create-store" element={<CreateStore />} />

          {/* --- SELLER ROUTES (Prefixed with /:username) --- */}
          <Route path="/:username/home" element={<Home />} />
          
          {/* NavBar links */}
          <Route path="/:username/create-listing" element={<CreateListing />} />
          <Route path="/:username/profile" element={<AccountSettings />} />
          <Route path="/:username/profile/edit" element={<EditAccountSettings />} />
          
          {/* Order Flows */}
          <Route path="/:username/new-orders" element={<NewOrders />} />
          <Route path="/:username/all-orders" element={<AllOrders />} />
          <Route path="/:username/order/:id" element={<OrderDetail />} />
          <Route path="/:username/order/:orderId/summary" element={<OrderSummary />} />
          <Route path="/:username/order/:orderId/product/:productId" element={<ProductOrderedDetail />} />
          
          {/* Listing Flows */}
          <Route path="/:username/listings" element={<Listings />} />
          <Route path="/:username/listing/:id" element={<ListingDetail />} />
          <Route path="/:username/edit-listing/:id" element={<EditListing />} />

          {/* --- BUYER FLOWS --- */}
          <Route path="/:slug" element={<StoreFront />} />
          <Route path=":slug/product/:id" element={<Product />} />
          <Route path=":slug/cart" element={<Cart />} />
          <Route path=":slug/order-success" element={<OrderSuccess />} />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthGuard>
    </Router>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './client'; // Imported to check session and db status
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
  const [authStatus, setAuthStatus] = useState('loading'); // 'loading' | 'unauth' | 'no_store' | 'has_store'

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      // Fetch the current session[cite: 12, 13]
      const { data: { session } } = await supabase.auth.getSession();

      // Rule 4 Check: No session exists
      if (!session) {
        if (isMounted) setAuthStatus('unauth');
        return;
      }

      // Session exists (meaning Seller exists). Check if a store is tied to them.
      // UPDATE 'stores' and 'seller_id' TO MATCH YOUR DB SCHEMA
      const { data: stores } = await supabase
        .from('store') 
        .select('id')
        .eq('seller_id', session.user.id) 
        .limit(1);

      if (isMounted) {
         if (stores && stores.length > 0) {
           setAuthStatus('has_store');
         } else {
           setAuthStatus('no_store');
         }
      }
    };

    checkStatus();

    // Listen for auth changes (like logging in or out) to re-evaluate rules
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkStatus();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Show a blank loading screen while verifying the database state
  if (authStatus === 'loading') {
    return <div className="page-container flex-center">Loading...</div>; 
  }

  const path = location.pathname;
  const isPublicRoute = path === '/login' || path === '/create-seller';
  const isCreateStoreRoute = path === '/create-store';

  // Rule 4 Enforcement: No session -> user can ONLY access login and create-seller
  if (authStatus === 'unauth' && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  // Rule 1 Enforcement: Session logged in -> user CANNOT access login or create-seller
  if (authStatus !== 'unauth' && isPublicRoute) {
     return <Navigate to={authStatus === 'has_store' ? '/home' : '/create-store'} replace />;
  }

  // Rule 3 Enforcement: Seller exists but NO store -> user can ONLY access create-store
  if (authStatus === 'no_store' && !isCreateStoreRoute) {
    return <Navigate to="/create-store" replace />;
  }

  // Rule 2 Enforcement: Store exists -> user CANNOT access create-store
  if (authStatus === 'has_store' && isCreateStoreRoute) {
    return <Navigate to="/home" replace />;
  }

  // If the user passes all rule checks, render the page they requested
  return children;
};


// 2. Wrap the Routes in the App Component
const App = () => {
  return (
    <Router>
      {/* AuthGuard must be inside Router to use the useLocation hook */}
      <AuthGuard>
        <Routes>
          {/* Core Auth & Flow Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/create-seller" element={<CreateSeller />} />
          <Route path="/create-store" element={<CreateStore />} />
          <Route path="/home" element={<Home />} />

          {/* NavBar links */}
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/profile" element={<AccountSettings />} />
          <Route path="/profile/edit" element={<EditAccountSettings />} />
          
          {/* Order Flows */}
          <Route path="/new-orders" element={<NewOrders />} />
          <Route path="/all-orders" element={<AllOrders />} />
          <Route path="/order/:id" element={<OrderDetail />} />
          <Route path="/order/:orderId/summary" element={<OrderSummary />} />
          <Route path="/order/:orderId/product/:productId" element={<ProductOrderedDetail />} />
          
          {/* Listing Flows */}
          <Route path="/listings" element={<Listings />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />

          {/* Buyer Flows */}
          <Route path="/storefront" element={<StoreFront />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthGuard>
    </Router>
  );
};

export default App;
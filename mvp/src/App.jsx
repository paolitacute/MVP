import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

const App = () => {
  return (
    <Router>
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
    </Router>
  );
};

export default App;
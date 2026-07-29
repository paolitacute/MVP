import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client'; 
import EditButton from '../components/EditButton';
import BackButton from '../components/BackButton';
import HeaderText from '../components/HeaderText';
import CategoryDetail from '../components/CategoryDetail';
import NavBar from '../components/NavBar';
import ActionButton from '../components/ActionButton'; 

const AccountSettings = () => {
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAccountDetails();
  }, []);

  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      
      // 1. Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError || new Error('No user authenticated');

      // 2. Fetch seller information
      const { data: sellerData, error: sellerError } = await supabase
        .from('seller')
        .select('name, email, phone')
        .eq('id', user.id)
        .single();

      if (sellerError) throw sellerError;

      // 3. Fetch store information
      const { data: storeData, error: storeError } = await supabase
        .from('store')
        .select('name, slug, phone, email, instagram, address, description')
        .eq('seller_id', user.id)
        .single();

      if (storeError && storeError.code !== 'PGRST116') { // Ignore error if they don't have a store yet
        throw storeError;
      }

      setSeller(sellerData);
      setStore(storeData);
    } catch (err) {
      console.error("Error fetching account settings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle the logout sequence
  const handleLogout = async () => {
    try {
      // 1. Tell Supabase to destroy the session and clear local tokens
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error logging out:", error.message);
        return;
      }
      
      // 2. Redirect the user back to the login screen
      navigate('/login', { replace: true }); 
      
    } catch (err) {
      console.error("Unexpected error during logout:", err);
    }
  };

  if (loading) {
    return (
      <div className="page-container flex-center" style={{ paddingBottom: '6rem' }}>
        <p>Loading account details...</p>
        <NavBar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container flex-center" style={{ paddingBottom: '6rem', color: 'red' }}>
        <p>Error loading account: {error}</p>
        <NavBar />
      </div>
    );
  }

  return (
    <>
      <div className="page-container" style={{ paddingBottom: '6rem' }}>
        
        {/* Header Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BackButton goTo="/home"/>
            <HeaderText text="Account Settings" />
          </div>
          
          {/* Navigation to the edit screen */}
          <EditButton onClick={() => navigate('/profile/edit')} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
          {/* Section 1: Seller Information */}
          <div className="form-container" style={{ gap: '1rem', padding: '1.5rem', width: '100%', maxWidth: '100%' }}>
            <h3 className="section-subtitle" style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Seller Information
            </h3>
            <CategoryDetail category="Name" option={seller?.name || 'N/A'} />
            <CategoryDetail category="Email" option={seller?.email || 'N/A'} />
            <CategoryDetail category="Phone" option={seller?.phone || 'N/A'} />
            <CategoryDetail category="Password" option="********" />
          </div>

          {/* Section 2: Store Information */}
          {store && (
            <div className="form-container" style={{ gap: '1rem', padding: '1.5rem', width: '100%', maxWidth: '100%', marginBottom: '2rem' }}>
              <h3 className="section-subtitle" style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Store Information
              </h3>
              <CategoryDetail category="Store Name" option={store.name || 'N/A'} />
              <CategoryDetail category="Store Slug" option={store.slug || 'N/A'} />
              <CategoryDetail category="Phone" option={store.phone || 'N/A'} />
              <CategoryDetail category="Email" option={store.email || 'N/A'} />
              <CategoryDetail category="Instagram" option={store.instagram || 'N/A'} />
              <CategoryDetail category="Address" option={store.address || 'N/A'} />
              
              {/* Multi-line read-only fields utilizing listing-detail typography */}
              <div style={{ marginTop: '0.5rem' }}>
                  <span className="meta-label">Store Description</span>
                  <p className="listing-description">{store.description || 'No description provided.'}</p>
              </div>
            </div>
          )}
          
          {/* Logout Button */}
          <div style={{ marginTop: '1rem' }}>
            <ActionButton 
              text="Log Out" 
              onClick={handleLogout} 
            />
          </div>

        </div>

      </div>

      <NavBar />
    </>
  );
};

export default AccountSettings;
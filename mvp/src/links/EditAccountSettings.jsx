import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../client'; 
import BackButton from '../components/BackButton';
import HeaderText from '../components/HeaderText';
import Input from '../components/Input';
import ActionButton from '../components/ActionButton';
import NavBar from '../components/NavBar';
import Toast from '../components/Toast';

const EditAccountSettings = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  const [sellerForm, setSellerForm] = useState({});
  const [storeForm, setStoreForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State variables for the toast notification
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

      if (storeError && storeError.code !== 'PGRST116') { 
        throw storeError;
      }

      // Populate forms with fetched data
      if (sellerData) setSellerForm(sellerData);
      if (storeData) setStoreForm(storeData);

    } catch (err) {
      console.error("Error fetching account settings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    if (isSaving) return; // Prevent double-clicking
    setIsSaving(true);

    // 1. Trigger the toast animation
    setShowToast(true);

    // 2. Wait exactly 2 seconds, then hide the toast and navigate
    setTimeout(() => {
      setShowToast(false);
      
      // Wait a tiny bit for the hide animation to finish before navigating
      setTimeout(() => {
        navigate(`/${username}/profile`);
      }, 300);
      
    }, 2000);
  };

  if (loading) {
    return (
      <div className="page-container flex-center" style={{ paddingBottom: '6rem' }}>
        <p>Loading editable details...</p>
        <NavBar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container flex-center" style={{ paddingBottom: '6rem', color: 'red' }}>
        <p>Error loading details: {error}</p>
        <NavBar />
      </div>
    );
  }

  return (
    <>
      <div className="page-container" style={{ paddingBottom: '6rem', position: 'relative' }}>
        
        {/* Header Area */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
          <BackButton />
          <HeaderText text="Edit Settings" />
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Seller Information */}
          <div className="form-container" style={{ gap: '1rem', padding: '1.5rem', width: '100%', maxWidth: '100%' }}>
            <h3 className="section-subtitle" style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Seller Information
            </h3>
            <Input 
              label="Name" 
              value={sellerForm.name || ''} 
              onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })}
              required 
            />
            <Input 
              label="Email" 
              type="email"
              value={sellerForm.email || ''} 
              onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
              required 
            />
            <Input 
              label="Phone" 
              value={sellerForm.phone || ''} 
              onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
              required 
            />
            <Input 
              label="Password" 
              type="password"
              value="********" 
              onChange={(e) => setSellerForm({ ...sellerForm, password: e.target.value })}
              required
            />
          </div>

          {/* Section 2: Store Information */}
          <div className="form-container" style={{ gap: '1rem', padding: '1.5rem', width: '100%', maxWidth: '100%', marginBottom: '1rem' }}>
            <h3 className="section-subtitle" style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Store Information
            </h3>
            <Input 
              label="Store Name" 
              value={storeForm.name || ''} 
              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
              required 
            />
            <Input 
              label="Store Slug" 
              value={storeForm.slug || ''} 
              onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value })}
              required 
            />
            <Input 
              label="Phone" 
              value={storeForm.phone || ''} 
              onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
              required 
            />
            <Input 
              label="Email" 
              type="email"
              value={storeForm.email || ''} 
              onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
              required 
            />
            <Input 
              label="Instagram" 
              value={storeForm.instagram || ''} 
              onChange={(e) => setStoreForm({ ...storeForm, instagram: e.target.value })}
            />
            <Input 
              label="Address" 
              value={storeForm.address || ''} 
              onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
            />
            <Input 
              label="Store Description" 
              type='textarea'
              value={storeForm.description || ''} 
              onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
              rows={6}
            />
          </div>

          {/* Action Footer */}
          <div style={{ paddingBottom: '2rem' }}>
              <ActionButton 
                text={isSaving ? "Saving..." : "Save Changes"} 
                type="submit" 
              />
          </div>
        </form>

        <Toast 
          show={showToast} 
          message="Changes saved successfully!" 
        />
      </div>
      
      <NavBar />
    </>
  );
};

export default EditAccountSettings;
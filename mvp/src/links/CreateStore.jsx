import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../client';
import HeaderText from '../components/HeaderText';
import Input from '../components/Input';
import Checkbox from '../components/Checkbox';
import ActionButton from '../components/ActionButton';
import Badge from '../components/Badge';

const sanitizePhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits;
};

const CreateStore = () => {
  const navigate = useNavigate();
  const { username } = useParams();

  const [sellerDetails, setSellerDetails] = useState({
    email: '',
    phone: ''
  });

  const [formData, setFormData] = useState({
    storeName: '',
    slug: '',
    sameAsSeller: false,
    phone: '',
    email: '',
    instagram: '',
    address: '',
    description: '',
    delivery: false, 
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchSellerData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user) {
        setSellerDetails({
          email: user.email || '',
          phone: user.user_metadata?.phone || ''
        });
      } else if (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchSellerData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Sanitize business phone number before sending
    const sanitizedPhone = sanitizePhone(formData.phone);

    try {
      const { data: storeId, error } = await supabase.rpc('storecreation', {
        p_storename: formData.storeName,
        p_storeslug: formData.slug,
        p_storephone: sanitizedPhone,
        p_storeemail: formData.email,
        p_storeinstagram: formData.instagram,
        p_storeaddress: formData.address, 
        p_storedescription: formData.description,
        p_storedelivery: formData.delivery,
      });

      if (error) {
        setError(error.message); 
        setLoading(false);
        console.log("There was an error", error);
        return;  
      }

      setLoading(false);
      console.log('Store created:', formData.storeName);
      
      setTimeout(() => {
        navigate(`/${username}/home`); 
      }, 1000);

    } catch (err) {
      console.log(err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const formatSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .normalize("NFD")                   
      .replace(/[\u0300-\u036f]/g, "")    
      .replace(/[\s_]+/g, '-')            
      .replace(/[^a-z0-9-]/g, '');        
  };

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    
    setFormData((prev) => {
      const updatedState = {
        ...prev,
        [id]: type === 'checkbox' ? checked : value
      };

      if (id === 'storeName') {
        updatedState.slug = formatSlug(value);
      }

      if (id === 'sameAsSeller') {
        if (checked) {
          updatedState.phone = sellerDetails.phone;
          updatedState.email = sellerDetails.email;
        } else {
          updatedState.phone = '';
          updatedState.email = '';
        }
      }

      return updatedState;
    });
  };

  return (
    <main className="page-container flex-center" style={{ alignItems: 'flex-start', paddingTop: '4rem' }}>
      <form onSubmit={handleCreateStore} className="form-container">
        <HeaderText text="Create a store" />
        
        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div className="form-inputs">
          <Input label="Store name" id="storeName" value={formData.storeName} onChange={handleChange} required />
          <Input label="Slug" id="slug" value={formData.slug} onChange={handleChange} prefix="mvpname/" required />
          
          <Checkbox id="sameAsSeller" label="Same as the seller" checked={formData.sameAsSeller} onChange={handleChange} />
          
          <Input label="Business phone number" type="tel" id="phone" value={formData.phone} pattern="[\+]?\s?\(?[0-9]{3}\)?-?\s?.?[0-9]{3}\)?-?\s?.?[0-9]{4,6}" customErrorMessage="Por ejemplo, 8091234567" onChange={handleChange} required />
          <Input label="Business email" type="email" id="email" value={formData.email} onChange={handleChange} pattern="[a-z0-9]+@[a-z]+\.[a-z]{2,}" customErrorMessage="Please enter a valid lowercase email (e.g., name@domain.com)" required />
          
          <Input label="Instagram" id="instagram" value={formData.instagram} onChange={handleChange} prefix="@" pattern="[\w.]+" customErrorMessage="Only include letters and digits"/>
          <Input label="Store address" id="address" value={formData.address} onChange={handleChange} />
          <Input label="Store description" id="description" value={formData.description} onChange={handleChange} type='textarea' rows={5} />
          
          <div className="input-group" style={{ padding: '0.5rem 0' }}>
            <span className="input-label">Delivery?</span>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <Badge 
                text="Yes" 
                active={formData.delivery === true} 
                onClick={() => setFormData((prev) => ({ ...prev, delivery: true }))} 
                type="filter"
              />
              <Badge 
                text="No" 
                active={formData.delivery === false} 
                onClick={() => setFormData((prev) => ({ ...prev, delivery: false }))} 
                type="filter"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <ActionButton text={loading ? "Creating Store..." : "Create Store"} type="submit" disabled={loading} />
          
          <button 
            type="button" 
            onClick={handleLogout}
            className="tertiary-action-btn"
          >
            Log Out
          </button>
        </div>
      </form>
    </main>
  );
};

export default CreateStore;
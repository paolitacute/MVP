import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import HeaderText from '../components/HeaderText';
import Input from '../components/Input';
import Checkbox from '../components/Checkbox';
import ActionButton from '../components/ActionButton';

const CreateStore = () => {
  const navigate = useNavigate();

  // State to hold the securely fetched seller details
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
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch session data once when the component mounts
  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchSellerData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user) {
        setSellerDetails({
          email: user.email || '',
          phone: user.user_metadata?.phone || '' // Extracting phone from the metadata saved during sign-up
        });
      } else if (error) {
        console.error("Error fetching user data:", error.message);
      }
    };

    fetchSellerData();
  }, []); // Empty dependency array ensures this only runs once

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: storeId, error } = await supabase.rpc('storecreation', {
        p_storename: formData.storeName,
        p_storeslug: formData.slug,
        p_storephone: formData.phone,
        p_storeemail: formData.email,
        p_storeinstagram: formData.instagram,
        p_storeaddress: formData.address, 
        p_storedescription: formData.description,
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
        navigate('/home'); 
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
          // Auto-fill fields using the securely fetched sellerDetails state
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
          
          <Input label="Business phone number" type="tel" id="phone" value={formData.phone} pattern="[\+]?\s?\(?[0-9]{3}\)?-?\s?.?[0-9]{3}\)?-?\s?.?[0-9]{4,6}" onChange={handleChange} required />
          <Input label="Business email" type="email" id="email" value={formData.email} onChange={handleChange} pattern="[a-z0-9]+@[a-z0-9]+\.[a-z]{2,}" customErrorMessage="Please enter a valid lowercase email (e.g., name@domain.com)" required />
          
          <Input label="Instagram" id="instagram" value={formData.instagram} onChange={handleChange} prefix="@" pattern="[\w.]+" customErrorMessage="Only include letters and digits"/>
          <Input label="Store address" id="address" value={formData.address} onChange={handleChange} />
          <Input label="Store description" id="description" value={formData.description} onChange={handleChange} type='textarea' rows={5} />
        </div>

        <ActionButton text={loading ? "Creating Store..." : "Create Store"} type="submit" disabled={loading} />
      </form>
    </main>
  );
};

export default CreateStore;

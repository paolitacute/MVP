import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import HeaderText from '../components/HeaderText';
import Input from '../components/Input';
import ActionButton from '../components/ActionButton';

const sanitizePhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits;
};

const CreateSeller = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [formData, setFormData] = useState({
    name: '',
    createEmail: '',
    phone: '',
    password: ''
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    // Sanitize phone number before sending
    const sanitizedPhone = sanitizePhone(formData.phone);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.createEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            phone: sanitizedPhone, 
          }
        }
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        console.log("There was an error", error);
        return;
      }

      setLoading(false);
      console.log('Account created for:', formData.name);

      const sellerId = data.user?.id;
      navigate(`/create-store?id=${sellerId}`);

    } catch (err) {
      console.log(err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <main className="page-container flex-center">
      <form onSubmit={handleCreateAccount} className="form-container">
        <HeaderText text="Create Seller Account" />
        
        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        <div className="form-inputs">
          <Input 
            label="Full Name" 
            id="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
          <Input 
            label="Email Address" 
            type="email" 
            id="createEmail" 
            value={formData.createEmail} 
            onChange={handleChange}
            pattern="[a-z0-9]+@[a-z]+\.[a-z]{2,}"
            customErrorMessage="Please enter a valid lowercase email (e.g., name@domain.com)"
            required 
          />
          <Input 
            label="Phone Number" 
            type="tel" 
            id="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            pattern="[\+]?\s?\(?[0-9]{3}\)?-?\s?.?[0-9]{3}\)?-?\s?.?[0-9]{4,6}"
            customErrorMessage="Por ejemplo, 8091234567"
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            id="password" 
            value={formData.password} 
            onChange={handleChange} 
            required
          />
        </div>

        <ActionButton 
          text={loading ? "Creating Account..." : "Continue to Store Setup"} 
          type="submit" 
          disabled={loading} 
        />
      </form>
    </main>
  );
};

export default CreateSeller;
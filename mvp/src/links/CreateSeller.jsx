import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../client';
import HeaderText from '../components/HeaderText';
import Input from '../components/Input';
import ActionButton from '../components/ActionButton';

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
  
  // Added state for handling UI feedback during auth
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
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.createEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
              phone: formData.phone, 
          }
        }
      })

      //1. Check if Supabase returned an authentication error
      if (error) {
        setError(error.message); // Display the error to the user
        setLoading(false);
        console.log("There was an error", error);
        return;  //Stop execution so they don't proceed to the next page
      }

      setLoading(false);
      console.log('Account created for:', formData.name);

      // 2. Extract the user ID
      const sellerId = data.user?.id;

      // 3. Only pass the ID in the URL parameters
      navigate(`/create-store?id=${sellerId}`);

    } catch (err) {
      // 2. This catch block will now only handle unexpected exceptions or network failures
      console.log(err);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <main className="page-container flex-center">
      <form onSubmit={handleCreateAccount} className="form-container">
        <HeaderText text="Create Seller Account" />
        
        {/* Error messaging display */}
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
          {/* Changed value from formData.email to formData.createEmail to match state */}
          <Input 
            label="Email Address" 
            type="email" 
            id="createEmail" 
            value={formData.createEmail} 
            onChange={handleChange}
            pattern="[a-z0-9]+@[a-z0-9]+\.[a-z]{2,}"
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

        {/* Updated ActionButton to reflect loading state */}
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
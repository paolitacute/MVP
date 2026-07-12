import React, { useState } from 'react';
import CreateStore from './CreateStore';
import { User, Lock, Mail, Phone, ArrowLeft } from 'lucide-react';
import { Input } from './Input';
import { Button } from './Button';
import styles from './Auth.module.css';

export default function Auth({ onLogin }) {
  const [view, setView] = useState('login'); // 'login' or 'signup'
  const [signUpStep, setSignUpStep] = useState(1); // 1: Base Auth, 2: Seller Details, 3: Store
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field as the user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateSellerDetails = () => {
    const newErrors = {};
    // Checks for generic name@domain.extension format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    // Checks for exactly 10 digits
    const phoneRegex = /^\d{10}$/; 

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (view === 'login') {
      console.log('Logging in with:', { username: formData.username, password: formData.password });
      onLogin();
      return;
    }

    // Sign Up Flow
    if (signUpStep === 1) {
      setSignUpStep(2);
    } else if (signUpStep === 2) {
      if (validateSellerDetails()) {
        setSignUpStep(3);
      }
    } else if (signUpStep === 3) {
      // If you are handling the final store creation step in Auth.jsx directly:
      onLogin(); // <--- Or add it wherever your final successful API callback happens!
    }
  };

  const toggleView = () => {
    setView(prev => prev === 'login' ? 'signup' : 'login');
    setSignUpStep(1); // Reset step if toggling views
    setErrors({});
  };

  return (
    <main className={styles.container}>
      {view === 'signup' && signUpStep === 3 ? (
        // Render the new Store Setup component
        <div className={styles.card} style={{ maxWidth: '800px' }}>
          <CreateStore 
            sellerData={{ phone: formData.phone, email: formData.email }}
            onBack={() => setSignUpStep(2)}
            onSubmit={(storeData) => {
              console.log("Final Registration Data:", { seller: formData, store: storeData });
              // Execute final API call
              
              onLogin(); // <--- Add this line to transition to the Home dashboard!
            }}
          />
        </div>
      ) : (
        // Render the existing Login / Seller Setup Card (Steps 1 & 2)
        <section className={styles.card} aria-labelledby="auth-title">
          
          {/* Back button for Step 2 */}
          {view === 'signup' && signUpStep === 2 && (
            <button type="button" className={styles.backButton || styles.toggleLink} onClick={() => setSignUpStep(1)}>
              <ArrowLeft size={16} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> 
              Back
            </button>
          )}

          <h1 id="auth-title" className={styles.title}>
            {view === 'login' 
              ? 'Login to account' 
              : signUpStep === 1 ? 'Create an account' : 'Seller details'}
          </h1>
          
          <form onSubmit={handleSubmit} noValidate>
            
            {/* LOGIN OR SIGNUP STEP 1: Base Credentials */}
            {(view === 'login' || (view === 'signup' && signUpStep === 1)) && (
              <>
                <Input
                  label="Username"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  icon={User}
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  autoComplete="username"
                />
                
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  autoComplete={view === 'login' ? "current-password" : "new-password"}
                />
              </>
            )}

            {/* SIGNUP STEP 2: Seller Specifics */}
            {view === 'signup' && signUpStep === 2 && (
              <>
                <Input
                  label="Name"
                  type="text"
                  name="name"
                  placeholder="Business or full name"
                  icon={User}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                
                <Input
                  label="Email address"
                  type="email"
                  name="email"
                  placeholder="hello@example.com"
                  icon={Mail}
                  value={formData.email}
                  onChange={handleInputChange}
                  error={errors.email}
                  required
                />

                <Input
                  label="Personal phone number"
                  type="tel"
                  name="phone"
                  placeholder="1234567890"
                  icon={Phone}
                  value={formData.phone}
                  onChange={handleInputChange}
                  error={errors.phone}
                  maxLength={10}
                  required
                />
              </>
            )}
            
            <Button type="submit">
              {view === 'login' 
                ? 'Login' 
                : signUpStep === 1 ? 'Continue' : 'Complete Setup'}
            </Button>
          </form>

          <div className={styles.toggleContainer}>
            <span>
              {view === 'login' ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              type="button"
              className={styles.toggleLink}
              onClick={toggleView}
              aria-label={view === 'login' ? "Switch to create account view" : "Switch to login view"}
            >
              {view === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
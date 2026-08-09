import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../client';
import HeaderText from '../components/HeaderText';
import Input from '../components/Input';
import ActionButton from '../components/ActionButton';
import '../App.css';

const Login = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Added state for handling UI feedback during login
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { username } = useParams();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // 1. Authenticate the user with Supabase
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // 2. Handle authentication errors (e.g., wrong password, user doesn't exist)
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return; // Stop execution
      }

      setLoading(false);
      
      // 3. Navigate to Home and replace the history stack 
      // to prevent looping back to the login screen
      navigate(`/${username}/home`, { replace: true });
      
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error inesperado.");
      setLoading(false);
    }
  };

  return (
    <main className="page-container flex-center">
      <form onSubmit={handleLogin} className="form-container">
        <HeaderText text="Iniciar sesión" />
        
        {/* Error messaging display */}
        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        <div className="form-inputs">
          <Input 
            label="Correo electrónico del vendedor" 
            type="email"
            id="loginEmail"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            pattern="[a-z0-9]+@[a-z0-9]+\.[a-z]{2,}"
            customErrorMessage="Por favor ingresa un correo válido en minúsculas (por ejemplo, nombre@dominio.com)"
            required 
          />
          <Input 
            label="Contraseña" 
            type="password" 
            id="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        {/* Updated ActionButton to reflect loading state */}
        <ActionButton 
          text={loading ? "Iniciando sesión..." : "Iniciar sesión"} 
          type="submit" 
          disabled={loading}
        />
        
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            ¿Nuevo en la plataforma?{' '}
          </span>
          <button 
            type="button" 
            onClick={() => navigate('/create-seller')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary-purple)', 
              fontWeight: '600', 
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Crear una cuenta
          </button>
        </div>
      </form>
    </main>
  );
};

export default Login;
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../client';
import HeaderText from '../components/HeaderText';
import Input from '../components/Input';
import Checkbox from '../components/Checkbox';
import ActionButton from '../components/ActionButton';
import Badge from '../components/Badge';
import ImageUploader from '../components/ImageUploader';
import { uploadStoreLogo, saveStoreLogo } from '../utils/productImages'; 

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
  
  const [logoFile, setLogoFile] = useState(null); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State to track slug availability status
  const [slugStatus, setSlugStatus] = useState(null); // 'checking', 'available', 'taken', or null

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

  // Effect to verify slug availability with debounce
  useEffect(() => {
    const checkSlugAvailability = async () => {
      if (!formData.slug) {
        setSlugStatus(null);
        return;
      }

      setSlugStatus('checking');

      try {
        // NOTE: Change 'store' to your exact table name if it differs (e.g., 'stores')
        const { data, error } = await supabase
          .from('store') 
          .select('slug')
          .eq('slug', formData.slug)
          .maybeSingle();

        if (error) {
          console.error("Error checking slug:", error);
          setSlugStatus(null);
        } else if (data) {
          setSlugStatus('taken');
        } else {
          setSlugStatus('available');
        }
      } catch (err) {
        console.error(err);
        setSlugStatus(null);
      }
    };

    // Wait 500ms after the user stops typing before making the query
    const timeoutId = setTimeout(checkSlugAvailability, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.slug]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    
    // Prevent submission if slug is taken
    if (slugStatus === 'taken') {
      setError("El usuario de tu tienda ya está en uso. Por favor, elige otro.");
      return;
    }

    setError(null);
    setLoading(true);

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

      if (logoFile instanceof File) {
        const { publicUrl } = await uploadStoreLogo(logoFile, storeId);
        await saveStoreLogo(storeId, publicUrl);
      }

      setLoading(false);
      console.log('Store created:', formData.storeName);
      
      window.location.href = `/${username}/home`; 

    } catch (err) {
      console.log(err);
      setError("Ocurrió un error inesperado.");
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
        <HeaderText text="Crear una tienda" />

        <div className="form-inputs">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ width: '150px', height: '150px' }}>
              <ImageUploader 
                image={logoFile} 
                onImageSelected={(files) => setLogoFile(files[0])} 
                onDelete={() => setLogoFile(null)} 
                label="Logo de la Tienda" 
              />
            </div>
          </div>

          <Input label="Nombre de la tienda" id="storeName" value={formData.storeName} onChange={handleChange} required />
          
          <div>
            <Input label="Usuario de tu tienda" id="slug" value={formData.slug} onChange={handleChange} prefix="waku/" required />
            {slugStatus === 'taken' && (
              <span style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block', textAlign: 'left' }}>
                Este usuario de tienda ya está en uso.
              </span>
            )}
            {slugStatus === 'available' && formData.slug.length > 0 && (
              <span style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block', textAlign: 'left' }}>
                Usuario de tienda disponible.
              </span>
            )}
          </div>
          
          <Checkbox id="sameAsSeller" label="Igual que el vendedor" checked={formData.sameAsSeller} onChange={handleChange} />
          
          <Input label="Teléfono comercial" type="tel" id="phone" value={formData.phone} pattern="[\+]?	?\(?[0-9]{3}\)?-?\s?.?[0-9]{3}\)?-?\s?.?[0-9]{4,6}" customErrorMessage="Por ejemplo, 8091234567" onChange={handleChange} required />
          <Input label="Correo comercial" type="email" id="email" value={formData.email} onChange={handleChange} pattern="[a-z0-9]+@[a-z]+\.[a-z]{2,}" customErrorMessage="Por favor ingresa un correo válido en minúsculas (por ejemplo, nombre@dominio.com)" required />
          
          <Input label="Instagram" id="instagram" value={formData.instagram} onChange={handleChange} prefix="@" pattern="[a-z0-9._]+" customErrorMessage="Incluye solo letras y dígitos"/>
          <Input label="Dirección" id="address" value={formData.address} onChange={handleChange} />
          <Input label="Descripción de la tienda" id="description" value={formData.description} onChange={handleChange} type='textarea' rows={5} />
          
          <div className="input-group" style={{ padding: '0.5rem 0' }}>
            <span className="input-label">¿Ofrece Delivery?</span>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
              <Badge 
                text="Sí" 
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

          {error && (
          <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

          <ActionButton 
            text={loading ? "Creando tienda..." : "Crear tienda"} 
            type="submit" 
            disabled={loading || slugStatus === 'taken'} 
          />
          
          <button 
            type="button" 
            onClick={handleLogout}
            className="tertiary-action-btn"
          >
            Cerrar sesión
          </button>
        </div>

      </form>
    </main>
  );
};

export default CreateStore;
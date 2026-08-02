import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../client'; 
import BackButton from '../components/BackButton';
import HeaderText from '../components/HeaderText';
import Input from '../components/Input';
import ActionButton from '../components/ActionButton';
import NavBar from '../components/NavBar';
import Toast from '../components/Toast';
import Badge from '../components/Badge';

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

      // 3. Fetch store information (Including delivery field)
      const { data: storeData, error: storeError } = await supabase
        .from('store')
        .select('name, slug, phone, email, instagram, address, description, delivery')
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

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (isSaving) return; // Prevent double-clicking
    setIsSaving(true);

    try {
      // 1. Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw authError || new Error('No user authenticated');

      // 2. Update seller table
      const { error: sellerUpdateError } = await supabase
        .from('seller')
        .update({
          name: sellerForm.name,
          email: sellerForm.email,
          phone: sellerForm.phone,
        })
        .eq('id', user.id);

      if (sellerUpdateError) throw sellerUpdateError;

      // 3. Update store table including delivery field
      const { error: storeUpdateError } = await supabase
        .from('store')
        .update({
          name: storeForm.name,
          slug: storeForm.slug,
          phone: storeForm.phone,
          email: storeForm.email,
          instagram: storeForm.instagram,
          address: storeForm.address,
          delivery: storeForm.delivery,
          description: storeForm.description,
        })
        .eq('seller_id', user.id);

      if (storeUpdateError) throw storeUpdateError;

      // 4. Trigger the toast animation
      setShowToast(true);

      // 5. Wait 2 seconds, hide toast, and navigate back
      setTimeout(() => {
        setShowToast(false);
        
        setTimeout(() => {
          navigate(`/${username}/profile`);
        }, 300);
        
      }, 2000);

    } catch (err) {
      console.error("Error saving account settings:", err);
      alert('Error al guardar los cambios: ' + err.message);
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <>
      </>
      // <div className="page-container flex-center" style={{ paddingBottom: '6rem' }}>
      //   <p>Cargando detalles editables...</p>
      //   <NavBar />
      // </div>
    );
  }

  if (error) {
    return (
      <div className="page-container flex-center" style={{ paddingBottom: '6rem', color: 'red' }}>
        <p>Error al cargar los detalles: {error}</p>
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
          <HeaderText text="Editar configuración" />
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Seller Information */}
          <div className="form-container" style={{ gap: '1rem', padding: '1.5rem', width: '100%', maxWidth: '100%' }}>
            <h3 className="section-subtitle" style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Información del vendedor
            </h3>
            <Input 
              label="Nombre" 
              value={sellerForm.name || ''} 
              onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })}
              required 
            />
            <Input 
              label="Correo electrónico" 
              type="email"
              value={sellerForm.email || ''} 
              onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
              required 
            />
            <Input 
              label="Teléfono" 
              value={sellerForm.phone || ''} 
              onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
              required 
            />
            <Input 
              label="Contraseña" 
              type="password"
              value="********" 
              onChange={(e) => setSellerForm({ ...sellerForm, password: e.target.value })}
              required
            />
          </div>

          {/* Section 2: Store Information */}
          <div className="form-container" style={{ gap: '1rem', padding: '1.5rem', width: '100%', maxWidth: '100%', marginBottom: '1rem' }}>
            <h3 className="section-subtitle" style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Información de la tienda
            </h3>
            <Input 
              label="Nombre de la tienda" 
              value={storeForm.name || ''} 
              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
              required 
            />
            <Input 
              label="Slug de la tienda" 
              value={storeForm.slug || ''} 
              onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value })}
              required 
            />
            <Input 
              label="Teléfono" 
              value={storeForm.phone || ''} 
              onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
              required 
            />
            <Input 
              label="Correo electrónico" 
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
              label="Dirección" 
              value={storeForm.address || ''} 
              onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
            />

            <div className="input-group" style={{ padding: '0.5rem 0' }}>
              <span className="input-label">¿Ofrece Delivery?</span>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <Badge 
                  text="Sí" 
                  active={storeForm.delivery === true} 
                  onClick={() => setStoreForm((prev) => ({ ...prev, delivery: true }))} 
                  type="filter"
                />
                <Badge 
                  text="No" 
                  active={storeForm.delivery === false} 
                  onClick={() => setStoreForm((prev) => ({ ...prev, delivery: false }))} 
                  type="filter"
                />
              </div>
            </div>

            <Input 
              label="Descripción de la tienda" 
              type='textarea'
              value={storeForm.description || ''} 
              onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
              rows={6}
            />
          </div>

          {/* Action Footer */}
          <div style={{ paddingBottom: '2rem' }}>
              <ActionButton 
                text={isSaving ? "Guardando..." : "Guardar cambios"} 
                type="submit" 
              />
          </div>
        </form>

        <Toast 
          show={showToast} 
          message="¡Cambios guardados con éxito!" 
        />
      </div>
      
      <NavBar />
    </>
  );
};

export default EditAccountSettings;
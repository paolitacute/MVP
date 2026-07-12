import React, { useState } from 'react';
import { Store, Phone, Mail, MapPin, AlignLeft, ArrowLeft } from 'lucide-react';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import '../../App.css';
import store from './CreateStore.module.css';

export default function CreateStore({ onBack, onSubmit, sellerData }) {
  const [formData, setFormData] = useState({
    storeName: '',
    slug: '',
    sameAsSeller: false,
    phone: '',
    email: '',
    instagram: '',
    address: '',
    description: '',
    deliveryAvailable: true,
    customMessage: ''
  });

  const [slugEdited, setSlugEdited] = useState(false);

  // Auto-generate URL slug based on Store Name
  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => {
      const updates = { storeName: name };
      if (!slugEdited) {
        updates.slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }
      return { ...prev, ...updates };
    });
  };

  const handleSlugChange = (e) => {
    setSlugEdited(true);
    setFormData(prev => ({ ...prev, slug: e.target.value }));
  };

  const handleSameAsSellerToggle = (e) => {
    const isChecked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      sameAsSeller: isChecked,
      phone: isChecked ? sellerData.phone : '',
      email: isChecked ? sellerData.email : ''
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <button type="button" className={backButton} onClick={onBack}>
        <ArrowLeft size={16} /> Back to seller details
      </button>

      <h1 className={title} style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
        Create a store
      </h1>

      <form onSubmit={handleSubmit} className={store.storeForm} noValidate>
        {/* LEFT COLUMN */}
        <div className={store.column}>
          <Input
            label="Store name"
            type="text"
            name="storeName"
            placeholder="My Awesome Store"
            icon={Store}
            value={formData.storeName}
            onChange={handleNameChange}
            required
          />

          <div className={inputGroup}>
            <label className={label}>URL Slug</label>
            <div className={store.inputWithPrefix}>
              <span className={store.prefix}>app.com/</span>
              <input
                type="text"
                name="slug"
                className={`${input} ${store.prefixedInput}`}
                value={formData.slug}
                onChange={handleSlugChange}
                required
              />
            </div>
          </div>

          <label className={store.checkboxLabel}>
            <input
              type="checkbox"
              className={store.checkbox}
              checked={formData.sameAsSeller}
              onChange={handleSameAsSellerToggle}
            />
            Same as the seller
          </label>

          <Input
            label="Business phone number"
            type="tel"
            name="phone"
            placeholder="1234567890"
            icon={Phone}
            value={formData.phone}
            onChange={handleChange}
            maxLength={10}
            required
          />

          <Input
            label="Business email"
            type="email"
            name="email"
            placeholder="store@example.com"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            required
          />

          <div className={store.toggleContainer}>
            <span className={store.toggleLabel}>Delivery availability</span>
            <label className={store.switch}>
              <input
                type="checkbox"
                name="deliveryAvailable"
                checked={formData.deliveryAvailable}
                onChange={handleChange}
              />
              <span className={store.slider}></span>
            </label>
          </div>

          <div className={store.divider}></div>
          
          <div className={inputGroup}>
            <label className={label}>
              Instagram <span style={{ fontWeight: 'normal', color: '#9ca3af' }}>(optional)</span>
            </label>
            <div className={store.inputWithPrefix}>
              <span className={store.prefix} style={{ left: '0.8rem' }}>@</span>
              <input
                type="text"
                name="instagram"
                placeholder="instagram_handle"
                className={`${input} ${store.igPrefixedInput}`}
                value={formData.instagram}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={store.column}>
          <Input
            label={<>Store address <span style={{ fontWeight: 'normal', color: '#9ca3af' }}>(optional)</span></>}
            type="text"
            name="address"
            placeholder="123 Main St, City"
            icon={MapPin}
            value={formData.address}
            onChange={handleChange}
          />

          <Input
            label={<>Store description <span style={{ fontWeight: 'normal', color: '#9ca3af' }}>(optional)</span></>}
            type="text"
            name="description"
            placeholder="What do you sell?"
            icon={AlignLeft}
            value={formData.description}
            onChange={handleChange}
          />

          <div className={inputGroup}>
            <label className={label}>
                Custom message <span style={{ fontWeight: 'normal', color: '#9ca3af' }}>(optional)</span>
            </label>
            <textarea
              name="customMessage"
              className={store.textarea}
              placeholder="Hola! Somos NombreTienda&#10;&#10;Hiciste una orden el dia [FechaOrden].&#10;&#10;Según tu dirección el monto del delivery sería: [Introduce]&#10;&#10;Confirma para enviarte método de pago."
              value={formData.customMessage}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" style={{ marginTop: 'auto' }}>
            Launch Store
          </Button>
        </div>
      </form>
    </div>
  );
}
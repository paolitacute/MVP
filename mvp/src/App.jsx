// src/App.jsx
import React, { useState } from 'react';
import { Home as HomeIcon, PlusCircle, User, LogOut } from 'lucide-react';
import Home from './screens/Home/Home';
import Auth from './screens/AuthenticationWorkflow/Auth';
import OrdersWorkflow from './screens/OrdersWorkflow/OrdersWorkflow';
import styles from './screens/Home/Dashboard.module.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  // 1. Add state to track which order was clicked
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // 2. Create a unified navigation handler
  const handleNavigate = (tab, orderId = null) => {
    setActiveTab(tab);
    setSelectedOrderId(orderId);
  };

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={styles.layout}>

      {activeTab === 'home' && <Home onNavigate={handleNavigate} />}
      
      {/* 4. Pass the selectedOrderId into the Orders component */}
      {activeTab === 'orders' && (
        <OrdersWorkflow 
          initialOrderId={selectedOrderId} 
          onBackToHome={() => handleNavigate('home')} 
        />
      )}
      
      {activeTab === 'add' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          <h2>Add a Listing</h2>
          <p>This module will go here.</p>
        </div>
      )}
      
      {activeTab === 'profile' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2>Profile Settings</h2>
          <button 
            onClick={() => setIsAuthenticated(false)}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className={styles.bottomNav}>
        <button 
          className={`${styles.navItem} ${['home', 'orders'].includes(activeTab) ? styles.navItemActive : ''}`}
          onClick={() => handleNavigate('home')}
        >
          <HomeIcon size={24} />
          <span>Home</span>
        </button>
        
        <button 
          className={`${styles.navItem} ${activeTab === 'add' ? styles.navItemActive : ''}`}
          onClick={() => handleNavigate('add')}
        >
          <PlusCircle size={24} />
          <span>Add</span>
        </button>
        
        <button 
          className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
          onClick={() => handleNavigate('profile')}
        >
          <User size={24} />
          <span>Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
// src/App.jsx
import React, { useState } from 'react';
import { Home as HomeIcon, PlusCircle, User, LogOut } from 'lucide-react'; // Added LogOut icon
import Home from './components/dashboard/Home';
import Auth from './components/auth/Auth'; // Uncommented the Auth import
import styles from './components/dashboard/Dashboard.module.css';

function App() {
  // 1. State to track if the user is logged in
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // 2. The Gatekeeper: If not logged in, force the Auth view
  if (!isAuthenticated) {
    // We pass a prop called onLogin so the Auth component can tell App to change this state
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  // 3. Main Dashboard Layout (Only visible if isAuthenticated is true)
  return (
    <div className={styles.layout}>
      
      {activeTab === 'home' && <Home />}
      
      {activeTab === 'add' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          <h2>Add a Listing</h2>
          <p>This module will go here.</p>
        </div>
      )}
      
      {activeTab === 'profile' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2>Profile Settings</h2>
          <p>This module will go here.</p>
          
          {/* Logout Button */}
          <button 
            onClick={() => setIsAuthenticated(false)}
            style={{
              marginTop: '2rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ef4444', // Red for logout
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'transform 0.1s ease'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.96)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>
      )}

      <nav className={styles.bottomNav}>
        <button 
          className={`${styles.navItem} ${activeTab === 'home' ? styles.navItemActive : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <HomeIcon size={24} />
          <span>Home</span>
        </button>
        
        <button 
          className={`${styles.navItem} ${activeTab === 'add' ? styles.navItemActive : ''}`}
          onClick={() => setActiveTab('add')}
        >
          <PlusCircle size={24} />
          <span>Add</span>
        </button>
        
        <button 
          className={`${styles.navItem} ${activeTab === 'profile' ? styles.navItemActive : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={24} />
          <span>Profile</span>
        </button>
      </nav>

    </div>
  );
}

export default App;
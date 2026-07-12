// src/App.jsx
import React, { useState } from 'react';
import { Home as HomeIcon, PlusCircle, User } from 'lucide-react';
import Home from './components/dashboard/Home';
// import Auth from './components/auth/Auth'; 
import styles from './components/dashboard/Dashboard.module.css';

function App() {
  // State to manage the bottom navigation tabs
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className={styles.layout}>
      
      {/* Main Content Area */}
      {activeTab === 'home' && <Home />}
      
      {activeTab === 'add' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          <h2>Add a Listing</h2>
          <p>This module will go here.</p>
        </div>
      )}
      
      {activeTab === 'profile' && (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          <h2>Profile Settings</h2>
          <p>This module will go here.</p>
        </div>
      )}

      {/* Bottom Navigation Bar */}
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
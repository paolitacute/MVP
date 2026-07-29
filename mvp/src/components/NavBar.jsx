import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Home, PlusCircle, User } from 'lucide-react';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract the dynamic username from the current URL
  const { username } = useParams();

  // Dynamically build the paths using the extracted username
  const navItems = [
    { name: 'Home', path: `/${username}/home`, icon: Home },
    { name: 'Add', path: `/${username}/create-listing`, icon: PlusCircle }, 
    { name: 'Profile', path: `/${username}/profile`, icon: User },
  ];

  return (
    <nav className="navbar">
      {navItems.map((item) => {
        const Icon = item.icon;
        // The active state check will now perfectly match the parameterized URL
        const isActive = location.pathname === item.path;
        
        return (
          <button 
            key={item.name}
            className={`nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            aria-label={item.name}
          >
            <Icon size={24} />
            <span>{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default NavBar;
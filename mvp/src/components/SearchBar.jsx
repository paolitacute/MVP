import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ placeholder = "Buscar", value, onChange }) => {
  return (
    <div className="search-container">
      <Search className="search-icon" size={20} />
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchBar;
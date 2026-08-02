import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../SearchBar';
import Badge from '../Badge';
import HorizontalCardLeft from '../HorizontalCardLeft';
import HeaderText from '../HeaderText'; 
import DetailsLine from '../DetailsLine'; 
import BackButton from '../BackButton';

const formatDisplayDate = (dateString) => {
  
  
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-');
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  // parseInt removes any leading zeros from the day (e.g., "08" becomes "8")
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`; 
};

const formatTitle = (products) => {
    if (!products || !Array.isArray(products)) return '';
    return products
      .map(prod => `${prod.name}`)
      .join(', ');
};

// Helper to calculate a single product's total price including customizations
const calculateProductPrice = (product) => {
  if (!product || !product.price) return 0;
  const basePrice = parseFloat(product.price.replace('$', '')) || 0;
  const customizationsPrice = product.customizations?.reduce((sum, cust) => {
    return sum + (parseFloat(cust.price.replace('$', '')) || 0);
  }, 0) || 0;
  
  return basePrice + customizationsPrice;
};

// Helper to calculate the grand total for an entire order
const calculateOrderPrice = (order) => {
  if (!order || !order.products) return '$0.00';
  const total = order.products?.reduce((sum, product) => {
    return sum + calculateProductPrice(product);
  }, 0) || 0;
  
  return `$${total.toFixed(2)}`;
};

const HorizontalListPage = ({ title, filters, data, onClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [sortOrder, setSortOrder] = useState('newest');

  const filteredData = data.filter((item) => {
    const matchesFilter = activeFilter === 'Todo' || item.status === activeFilter;

    const searchLower = searchQuery.toLowerCase();
    
    // Updated to use the calculated order price for searchability
    const calculatedPrice = calculateOrderPrice(item);
    const searchableText = `${item.title} ${item.buyer?.name || ''} ${calculatedPrice}`.toLowerCase();
    const matchesSearch = !searchQuery || searchableText.includes(searchLower);

    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    const dateA = new Date(a.completedDate || a.sendByDate || 0).getTime();
    const dateB = new Date(b.completedDate || b.sendByDate || 0).getTime();
    
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const navigate = useNavigate();

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  return (
    
    <div className="list-page-layout">
      <BackButton />
      
      <div style={{ marginBottom: '1.5rem' }}>
        <HeaderText text={title} alignment='left' />
      </div>
      
      <SearchBar 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
        placeholder="buscar"
      />

      <div className="badge-scroll-container">
        <Badge 
          text={
            sortOrder === 'newest' ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ArrowDown size={16} color="var(--text-main, #333)" /> Nuevas
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ArrowUp size={16} color="var(--text-main, #333)" /> Viejas
              </span>
            )
          }
          type="filter"
          active={false} 
          onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')} 
        />

        {filters.map((filter) => (
          <Badge 
            key={filter} 
            text={filter} 
            type="filter"
            active={activeFilter === filter} 
            onClick={() => setActiveFilter(filter)} 
          />
        ))}
      </div>

      <div className="card-list-container">
        <div className="card-list-container">
          {filteredData.map((item) => {
            
            // Determine the correct date string for this specific item
            let dateString = null;
            if (item.sendByDate) {
              dateString = `Entregar para ${formatDisplayDate(item.sendByDate)}`;
            } else if (item.completedDate) {
              dateString = `Completado ${formatDisplayDate(item.completedDate)}`;
            }

            return (
              <HorizontalCardLeft 
                key={item.id} 
                imageSrc={item.products?.[0]?.image || ''} 
                imageNotifCount={item.itemCount}
                title={formatTitle(item.products)}
                status={item.status}
                subtitle={
                  <DetailsLine 
                    items={[ item.buyer.name, dateString, calculateOrderPrice(item) ]} 
                  />
                }
                onClick={() => onClick(item.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HorizontalListPage;
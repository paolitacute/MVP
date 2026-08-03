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
  
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`; 
};

const formatTitle = (products) => {
    if (!products || !Array.isArray(products)) return '';
    return products
      .map(prod => `${prod.name}`)
      .join(', ');
};

const calculateProductPrice = (product) => {
  if (!product || !product.price) return 0;
  const basePrice = parseFloat(product.price.replace('$', '')) || 0;
  const customizationsPrice = product.customizations?.reduce((sum, cust) => {
    return sum + (parseFloat(cust.price.replace('$', '')) || 0);
  }, 0) || 0;
  
  return basePrice + customizationsPrice;
};

const calculateOrderPrice = (order) => {
  if (!order || !order.products) return 'RD$0.00';
  const total = order.products?.reduce((sum, product) => {
    return sum + calculateProductPrice(product);
  }, 0) || 0;
  
  return `RD$${total.toFixed(2)}`;
};

const HorizontalListPage = ({ title, filters, data, onClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Set initial active filter based on the object structure
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [sortOrder, setSortOrder] = useState('newest');

  const filteredData = data.filter((item) => {
    // Check if the current filter is "all" or if the item's status matches the filter ID
    const matchesFilter = activeFilter.id === 'all' || item.status === activeFilter.id;

    const searchLower = searchQuery.toLowerCase();
    
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

        {/* Map through the filter objects to display the label */}
        {filters.map((filter) => (
          <Badge 
            key={filter.id} 
            text={filter.label} 
            type="filter"
            active={activeFilter.id === filter.id} 
            onClick={() => setActiveFilter(filter)} 
          />
        ))}
      </div>

      <div className="card-list-container">
        <div className="card-list-container">
          {filteredData.map((item) => {
            
            let dateString = null;
            if (item.sendByDate) {
              dateString = `Entregar para ${formatDisplayDate(item.sendByDate)}`;
            } else if (item.completedDate) {
              dateString = `Completado el ${formatDisplayDate(item.completedDate)}`;
            }

            // Fallback to item.status if for some reason the ID is missing from the filter array
            const statusLabel = filters.find(f => f.id === item.status)?.label || item.status;

            return (
              <HorizontalCardLeft 
                key={item.id} 
                imageSrc={item.products?.[0]?.image || ''} 
                imageNotifCount={item.itemCount}
                title={formatTitle(item.products)}
                status={statusLabel}
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
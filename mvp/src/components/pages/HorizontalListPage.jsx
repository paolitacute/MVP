import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
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
  
  return `RD$${Number(total.toFixed(2)).toLocaleString()}`;
};

const HorizontalListPage = ({ title, filters, data, onClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [sortOrder, setSortOrder] = useState('sooner');
  
  // New state and refs for badge scrolling
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filter and sort logic remains the same
  const filteredData = data.filter((item) => {
    const matchesFilter = activeFilter.id === 'all' || item.status === activeFilter.id;
    const searchLower = searchQuery.toLowerCase();
    const calculatedPrice = calculateOrderPrice(item);
    const searchableText = `${item.title} ${item.buyer?.name || ''} ${calculatedPrice}`.toLowerCase();
    const matchesSearch = !searchQuery || searchableText.includes(searchLower);

    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    const dateA = new Date(a.sendByDate || 0).getTime();
    const dateB = new Date(b.sendByDate || 0).getTime();
    return sortOrder === 'sooner' ? dateA - dateB : dateB - dateA;
  });

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check scroll position to toggle arrow visibility
  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // Math.ceil prevents floating point rounding errors from hiding the right arrow too early
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  // Run once on mount and when filters change to set initial arrow visibility
  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [filters]);

  const scrollBadges = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200; // Adjust for how far it should translate per click
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  return (
    <div className="list-page-layout">
      <BackButton />
      
      <div style={{ marginBottom: '1.5rem' }}>
        <HeaderText text={title} alignment='left' />
      </div>
      
      <SearchBar 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)} 
        placeholder="Buscar"
      />

      {/* New Wrapper for Grid Layout */}
      <div className="badge-area-wrapper">
        <button 
          className={`badge-scroll-arrow left ${!canScrollLeft ? 'hidden' : ''}`}
          onClick={() => scrollBadges('left')}
          aria-label="Scroll left"
        >
          <ArrowLeft size={18} />
        </button>

        <div 
          className="badge-scroll-container" 
          ref={scrollRef} 
          onScroll={checkScroll}
        >
          <Badge 
            text={
              sortOrder === 'sooner' ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ArrowDown size={16} color="var(--text-main, #333)" /> Próximas
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <ArrowUp size={16} color="var(--text-main, #333)" /> Posteriores
                </span>
              )
            }
            type="filter"
            active={false} 
            onClick={() => setSortOrder(prev => prev === 'sooner' ? 'later' : 'sooner')} 
          />

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

        <button 
          className={`badge-scroll-arrow right ${!canScrollRight ? 'hidden' : ''}`}
          onClick={() => scrollBadges('right')}
          aria-label="Scroll right"
        >
          <ArrowRight size={18} />
        </button>
      </div>

      <div className="card-list-container">
         {/* Mapping filteredData remains the same... */}
         {filteredData.map((item) => {
            let dateString = null;
            if (item.sendByDate) {
              dateString = `Entregar para ${formatDisplayDate(item.sendByDate)}`;
            } else if (item.completedDate) {
              dateString = `Completado el ${formatDisplayDate(item.completedDate)}`;
            }

            const statusLabel = filters.find(f => f.id === item.status)?.label || item.status;
            console.log(statusLabel)

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
  );
};

export default HorizontalListPage;
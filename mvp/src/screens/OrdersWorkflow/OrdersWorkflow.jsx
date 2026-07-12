// src/components/orders/OrdersWorkflow.jsx
import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, Package, User, MapPin, Phone, ArrowDownUp } from 'lucide-react';
import styles from './Orders.module.css';

const initialOrders = [
  {
    id: 'ORD-001',
    buyerName: 'Alice Smith',
    phone: '809-333-5555',
    address: '1234 Elmo Street, Santo Domingo',
    orderedOn: 'Oct 24, 2023',
    sendByDate: 'Oct 28, 2023',
    completedDate: null,
    total: '$48.00',
    status: 'Pending',
    items: [
      { id: 'P1', name: 'Ceramic Mug', price: '$24.00', customizations: [{ label: 'Color', value: 'Lavender' }, { label: 'Engraving', value: '"Alice"' }] },
      { id: 'P2', name: 'Ceramic Plate', price: '$24.00', customizations: [{ label: 'Color', value: 'White' }, { label: 'Trim', value: 'Gold' }] }
    ]
  },
  {
    id: 'ORD-002',
    buyerName: 'Bob Jones',
    phone: '809-555-1234',
    address: '5678 Oak Ave, Santo Domingo',
    orderedOn: 'Oct 20, 2023',
    sendByDate: null,
    completedDate: 'Oct 22, 2023',
    total: '$45.00',
    status: 'Completed',
    items: [
      { id: 'P3', name: 'Wool Scarf', price: '$45.00', customizations: [{ label: 'Length', value: 'Long' }, { label: 'Pattern', value: 'Striped' }] }
    ]
  }
];

// 1. Accept the initialOrderId prop
export default function OrdersWorkflow({ initialOrderId, onBackToHome }) {
  const [orders, setOrders] = useState(initialOrders);
  const [view, setView] = useState('list');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  // 2. React to the incoming order ID and open the detail view immediately
  useEffect(() => {
    if (initialOrderId) {
      const order = orders.find(o => o.id === initialOrderId);
      if (order) {
        setSelectedOrder(order);
        setView('detail');
      }
    } else {
      setView('list');
      setSelectedOrder(null);
    }
  }, [initialOrderId, orders]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setView('detail');
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setView('product');
  };

  // 3. This already directs back to 'list' (All Orders) when clicking Back
  const handleBack = () => {
    if (view === 'product') setView('detail');
    else if (view === 'detail') {
      setSelectedOrder(null);
      setView('list'); 
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    const updatedOrder = { ...selectedOrder, status: newStatus };
    
    if (newStatus === 'Completed') {
      updatedOrder.completedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
      updatedOrder.completedDate = null;
    }

    setSelectedOrder(updatedOrder);
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  // Filtered Data
  // Filtered and Sorted Data
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'All' || order.status === filter;
    const matchesSearch = order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    const dateA = new Date(a.orderedOn);
    const dateB = new Date(b.orderedOn);
    // Sorts descending (newest first) or ascending (oldest first)
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className={styles.container}>
      {/* ---------------- LIST VIEW ---------------- */}
      {view === 'list' && (
        <div className={styles.view}>
          
          {/* 2. UPDATE THIS HEADER: Add the back button to go home */}
          <header className={styles.header}>
            <button onClick={onBackToHome} className={styles.backButton} aria-label="Go back to Home">
              <ChevronLeft size={20} /> Home
            </button>
            <h1 className={styles.title}>Orders</h1>
          </header>
          
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={18} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search orders"
            />
          </div>

          <div className={styles.filters} role="group" aria-label="Filter orders">
            {/* Sort Toggle Button */}
            <button 
              className={styles.filterPill} 
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
              aria-label="Toggle sort order"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}
            >
              <ArrowDownUp size={14} />
              {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
            </button>
            
            {['All', 'Pending', 'In progress', 'Completed'].map(f => (
              <button 
                key={f}
                className={`${styles.filterPill} ${filter === f ? styles.activeFilter : ''}`}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
              >
                {f}
              </button>
            ))}
          </div>

          <div className={styles.orderList}>
            {filteredOrders.map(order => (
              <button 
                key={order.id} 
                className={styles.orderCard} 
                onClick={() => handleOrderClick(order)}
                aria-label={`View details for order ${order.id}`}
              >
                <div className={styles.imagePlaceholder}>
                  {order.items.length > 1 && <span className={styles.badge}>{order.items.length}</span>}
                  <Package size={24} className={styles.placeholderIcon} />
                </div>
                <div className={styles.orderInfo}>
                  <h3 className={styles.productNames}>
                    {order.items.map(i => i.name).join(', ')}
                  </h3>
                  <p className={styles.buyerDetails}>{order.buyerName} • {order.orderedOn} • {order.total}</p>
                  <span className={`${styles.statusBadge} ${styles[order.status.replace(/\s+/g, '').toLowerCase()]}`}>
                    {order.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- ORDER DETAIL VIEW ---------------- */}
      {view === 'detail' && selectedOrder && (
        <div className={styles.view}>
          <header className={styles.header}>
            <button onClick={handleBack} className={styles.backButton} aria-label="Go back">
              <ChevronLeft size={20} /> Back
            </button>
            <h1 className={styles.title}>Order detail</h1>
          </header>

          <div className={styles.dynamicHeader}>
            {selectedOrder.status === 'Completed' ? (
              <h2 className={styles.statusHeadline}>Completed on {selectedOrder.completedDate}</h2>
            ) : selectedOrder.status === 'Pending' ? (
              <h2 className={`${styles.statusHeadline} ${styles.textPending}`}>Pending</h2>
            ) : (
              <h2 className={styles.statusHeadline}>Send by {selectedOrder.sendByDate || 'TBD'}</h2>
            )}
          </div>

          <div className={styles.orderMeta}>
            <span className={styles.metaText}>Ordered on {selectedOrder.orderedOn} • {selectedOrder.total}</span>
            <div className={styles.selectWrapper}>
              <select 
                className={styles.statusSelect} 
                value={selectedOrder.status}
                onChange={handleStatusChange}
                aria-label="Change order status"
              >
                <option value="Pending">Pending</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className={styles.customerCard}>
            <h3 className={styles.customerName}><User size={16}/> {selectedOrder.buyerName}</h3>
            <p className={styles.customerContact}><Phone size={14}/> {selectedOrder.phone}</p>
            <p className={styles.customerContact}><MapPin size={14}/> {selectedOrder.address}</p>
          </div>

          <div className={styles.itemsSection}>
            <h3 className={styles.sectionTitle}>{selectedOrder.items.length} items</h3>
            <div className={styles.itemList}>
              {selectedOrder.items.map(item => (
                <button 
                  key={item.id} 
                  className={styles.itemCard}
                  onClick={() => handleProductClick(item)}
                  aria-label={`View details for ${item.name}`}
                >
                  <div className={styles.imagePlaceholderSmall}>
                    <Package size={20} />
                  </div>
                  <div className={styles.itemInfo}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemSummary}>
                      {item.customizations.map(c => c.value).join(', ')}
                    </span>
                  </div>
                  <span className={styles.itemPrice}>{item.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- PRODUCT DETAIL VIEW ---------------- */}
      {view === 'product' && selectedProduct && (
        <div className={styles.view}>
          <header className={styles.header}>
            <button onClick={handleBack} className={styles.backButton} aria-label="Go back">
              <ChevronLeft size={20} /> Back
            </button>
            <h1 className={styles.title}>Products ordered</h1>
          </header>

          <div className={styles.productHero}>
            <div className={styles.imagePlaceholderLarge}>
              <Package size={48} />
            </div>
            <div className={styles.productHeroInfo}>
              <h2 className={styles.heroName}>{selectedProduct.name}</h2>
              <p className={styles.heroPrice}>{selectedProduct.price}</p>
            </div>
          </div>

          <div className={styles.customizationsList}>
            {selectedProduct.customizations.map((cust, idx) => (
              <div key={idx} className={styles.customizationRow}>
                <span className={styles.customizationLabel}>{cust.label}:</span>
                <span className={styles.customizationValue}>{cust.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
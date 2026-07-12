// src/components/dashboard/Home.jsx
import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import styles from './Dashboard.module.css';

// 1. Align mock IDs with OrdersWorkflow.jsx
const pendingData = [
  { id: 'ORD-001', product: 'Ceramic Mug & Plate', buyer: 'Alice Smith', price: '$48.00' },
  { id: 'ORD-003', product: 'Desk Lamp', buyer: 'Charlie Day', price: '$60.00' },
];

const ordersData = [
  { id: 'ORD-002', product: 'Wool Scarf', buyer: 'Bob Jones', price: '$45.00' },
  { id: 'ORD-004', product: 'Leather Wallet', buyer: 'Diana Prince', price: '$55.00' },
];

const listingsData = [
  { id: 'L1', product: 'Ceramic Mug', price: '$24.00' },
  { id: 'L2', product: 'Wool Scarf', price: '$45.00' },
  { id: 'L3', product: 'Desk Lamp', price: '$60.00' },
];

// 2. Add an onClick prop and apply it to the card
const ProductCard = ({ product, buyer, price, onClick }) => (
  <div 
    className={styles.card} 
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }} // Make it look clickable
  >
    <div className={styles.cardImagePlaceholder}>
      <ImageIcon size={24} />
    </div>
    <div className={styles.cardDetails}>
      <span className={styles.productName}>{product}</span>
      {buyer && <span className={styles.buyerName}>for {buyer}</span>}
      <span className={styles.price}>{price}</span>
    </div>
  </div>
);

export default function Home({ onNavigate }) {
  return (
    <div className={styles.homeContainer}>
      
      {/* Pending Orders Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Pending</h2>
          <button className={styles.viewAll} onClick={() => onNavigate('orders')}>
            View all
          </button>
        </div>
        <div className={styles.cardList}>
          {pendingData.map((item) => (
            <ProductCard 
              key={item.id} 
              product={item.product} 
              buyer={item.buyer} 
              price={item.price}
              onClick={() => onNavigate('orders', item.id)} // 3. Pass ID on click
            />
          ))}
        </div>
      </section>

      {/* All Orders Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Orders</h2>
          <button className={styles.viewAll} onClick={() => onNavigate('orders')}>
            View all
          </button>
        </div>
        <div className={styles.cardList}>
          {ordersData.map((item) => (
            <ProductCard 
              key={item.id} 
              product={item.product} 
              buyer={item.buyer} 
              price={item.price}
              onClick={() => onNavigate('orders', item.id)} // 3. Pass ID on click
            />
          ))}
        </div>
      </section>

      {/* Listings Section (No navigation on click for listings yet) */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Listings</h2>
          <button className={styles.viewAll}>View all</button>
        </div>
        <div className={styles.cardList}>
          {listingsData.map((item) => (
            <ProductCard 
              key={item.id} 
              product={item.product} 
              price={item.price} 
            />
          ))}
        </div>
      </section>

    </div>
  );
}
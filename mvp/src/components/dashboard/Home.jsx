// src/components/dashboard/Home.jsx
import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import styles from './Dashboard.module.css';

// Mock Data for the UI
const pendingData = [
  { id: 1, product: 'Ceramic Mug', buyer: 'Alice Smith', price: '$24.00' },
  { id: 2, product: 'Wool Scarf', buyer: 'Bob Jones', price: '$45.00' },
  { id: 3, product: 'Desk Lamp', buyer: 'Charlie Day', price: '$60.00' },
];

const ordersData = [
  { id: 4, product: 'Leather Wallet', buyer: 'Diana Prince', price: '$55.00' },
  { id: 5, product: 'Oak Coasters', buyer: 'Evan Wright', price: '$18.00' },
  { id: 6, product: 'Linen Apron', buyer: 'Fiona Apple', price: '$32.00' },
];

const listingsData = [
  { id: 7, product: 'Ceramic Mug', price: '$24.00' },
  { id: 8, product: 'Wool Scarf', price: '$45.00' },
  { id: 9, product: 'Desk Lamp', price: '$60.00' },
];

// Reusable Card Component
const ProductCard = ({ product, buyer, price }) => (
  <div className={styles.card}>
    <div className={styles.cardImagePlaceholder}>
      <ImageIcon size={24} />
    </div>
    <div className={styles.cardDetails}>
      <span className={styles.productName}>{product}</span>
      {/* Only render buyer name if it is passed in as a prop */}
      {buyer && <span className={styles.buyerName}>for {buyer}</span>}
      <span className={styles.price}>{price}</span>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      
      {/* Pending Orders Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Pending</h2>
          <button className={styles.viewAll}>View all</button>
        </div>
        <div className={styles.cardList}>
          {pendingData.map((item) => (
            <ProductCard 
              key={item.id} 
              product={item.product} 
              buyer={item.buyer} 
              price={item.price} 
            />
          ))}
        </div>
      </section>

      {/* All Orders Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Orders</h2>
          <button className={styles.viewAll}>View all</button>
        </div>
        <div className={styles.cardList}>
          {ordersData.map((item) => (
            <ProductCard 
              key={item.id} 
              product={item.product} 
              buyer={item.buyer} 
              price={item.price} 
            />
          ))}
        </div>
      </section>

      {/* Listings Section (No buyer name) */}
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
              // Notice: buyer prop is intentionally omitted here
            />
          ))}
        </div>
      </section>

    </div>
  );
}
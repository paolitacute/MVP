import React from 'react';
import styles from './Auth.module.css';

export function Button({ children, ...props }) {
  return (
    <button className={styles.button} {...props}>
      {children}
    </button>
  );
}
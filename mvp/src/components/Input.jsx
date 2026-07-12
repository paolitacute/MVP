import React, { useId } from 'react';
import '../App.css'

export function Input({ label, icon: Icon, error, ...props }) {
  const inputId = useId();

  return (
    <div className={styles.inputGroup}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputWrapper}>
        <input 
          id={inputId} 
          className={`${styles.input} ${error ? styles.inputError : ''}`} 
          {...props} 
        />
        {Icon && <Icon className={styles.icon} aria-hidden="true" />}
      </div>
      {/* Accessible error message */}
      {error && (
        <span className={styles.errorText} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
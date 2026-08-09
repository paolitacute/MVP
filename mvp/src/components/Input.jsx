import React from 'react';

const Input = ({ label, type = 'text', value, onChange, id, required = false, prefix, rows, pattern, customErrorMessage, options = [], min, max }) => {
  const isTextArea = type === 'textarea';
  const isDropdown = type === 'dropdown';
  const isDatePicker = type === 'datepicker';
  const isNumberStepper = type === 'number-stepper';
  
  // Custom handler for the increment/decrement buttons to mimic standard event structure
  const handleStepperChange = (newValue) => {
    if (min !== undefined && newValue < min) newValue = min;
    if (max !== undefined && newValue > max) newValue = max;
    onChange({ target: { id, name: id, value: newValue } });
  };

  const renderInputCore = () => {
    if (isTextArea) {
      return (
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          className="input-field"
          required={required}
          aria-required={required}
          rows={rows || 4}
          style={{ width: '100%', resize: 'vertical' }}
        />
      );
    } 
    
    if (isDropdown) {
      return (
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          className="input-field"
          required={required}
          aria-required={required}
          style={{ width: '100%', paddingLeft: prefix ? '0.2rem' : '' }}
        >
          <option value="" disabled hidden>Selecciona una opción</option>
          {options.map((opt, index) => (
            <option key={index} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }
    
    if (isNumberStepper) {
      return (
        <input
          type="number"
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          onWheel={(e) => e.target.blur()}
          className="input-field"
          required={required}
          min={min}
          max={max}
          style={{ 
            width: '100%', 
            textAlign: 'center', 
            padding: '0.75rem 0',
            MozAppearance: 'textfield', 
            WebkitAppearance: 'none' 
          }}
        />
      );
    }

    return (
      <input
        type={isDatePicker ? "date" : type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        onWheel={type === 'number' ? (e) => e.target.blur() : undefined}
        className="input-field"
        required={required}
        aria-required={required}
        pattern={pattern}
        title={customErrorMessage}
        lang={isDatePicker ? "es" : undefined}
        style={{ width: '100%', paddingLeft: prefix ? '0.2rem' : '' }}
      />
    );
  };

  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input-label" style={{ width: '100%', textAlign: 'left' }}>
          {label} 
          {required && <span style={{ color: '#e53e3e', marginLeft: '0.25rem' }}>*</span>}
          {!required && <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginLeft: '0.25rem' }}>(opcional)</span>}
        </label>
      )}
      
      {isNumberStepper ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
          <button
            type="button"
            onClick={() => handleStepperChange(Number(value) - 1)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              border: '2px solid var(--border-light)', backgroundColor: 'var(--surface-color)',
              color: 'var(--text-main)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1,
              transition: 'all 0.2s ease'
            }}
          >
            -
          </button>
          
          <div className="input-box" style={{ flexGrow: 1, padding: 0 }}>
             {renderInputCore()}
          </div>

          <button
            type="button"
            onClick={() => handleStepperChange(Number(value) + 1)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              border: '2px solid var(--border-light)', backgroundColor: 'var(--surface-color)',
              color: 'var(--text-main)', cursor: 'pointer', fontSize: '1.25rem', lineHeight: 1,
              transition: 'all 0.2s ease'
            }}
          >
            +
          </button>
        </div>
      ) : (
        <div className="input-box" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {prefix && (
            <span style={{left: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
              {prefix}
            </span>
          )}
          {renderInputCore()}
        </div>
      )}
    </div>
  );
};

export default Input;
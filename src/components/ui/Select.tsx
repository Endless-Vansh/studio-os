import React from 'react';
import './Input.css';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  helperText?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`studio-input-group ${error ? 'studio-input-group--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="studio-input__label">
          {label}
        </label>
      )}
      <div className="studio-input__wrapper">
        <select id={selectId} className="studio-input studio-select" {...props}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="studio-select__arrow">↓</span>
      </div>
      {error && <span className="studio-input__error-msg">{error}</span>}
      {!error && helperText && <span className="studio-input__helper-msg">{helperText}</span>}
    </div>
  );
};

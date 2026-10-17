import React from 'react';
import './Input.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  iconLeft,
  iconRight,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`studio-input-group ${error ? 'studio-input-group--error' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="studio-input__label">
          {label}
        </label>
      )}
      <div className="studio-input__wrapper">
        {iconLeft && <span className="studio-input__icon studio-input__icon--left">{iconLeft}</span>}
        <input
          id={inputId}
          className={`studio-input ${iconLeft ? 'studio-input--has-left' : ''} ${
            iconRight ? 'studio-input--has-right' : ''
          }`}
          {...props}
        />
        {iconRight && <span className="studio-input__icon studio-input__icon--right">{iconRight}</span>}
      </div>
      {error && <span className="studio-input__error-msg">{error}</span>}
      {!error && helperText && <span className="studio-input__helper-msg">{helperText}</span>}
    </div>
  );
};

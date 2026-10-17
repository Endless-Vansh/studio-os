import React from 'react';
import './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'vermilion';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  iconLeft,
  iconRight,
  isLoading,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`studio-btn studio-btn--${variant} studio-btn--${size} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="studio-btn__spinner" />
      ) : (
        iconLeft && <span className="studio-btn__icon studio-btn__icon--left">{iconLeft}</span>
      )}
      <span className="studio-btn__label">{children}</span>
      {!isLoading && iconRight && (
        <span className="studio-btn__icon studio-btn__icon--right">{iconRight}</span>
      )}
    </button>
  );
};

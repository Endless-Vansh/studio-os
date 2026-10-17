import React from 'react';
import './Badge.css';

export type BadgeVariant = 
  | 'neutral' 
  | 'draft' 
  | 'review' 
  | 'approved' 
  | 'paid' 
  | 'overdue' 
  | 'vermilion' 
  | 'sage'
  | 'ink';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = ''
}) => {
  return (
    <span className={`studio-badge studio-badge--${variant} studio-badge--${size} ${className}`}>
      {dot && <span className="studio-badge__dot" />}
      <span className="studio-badge__text">{children}</span>
    </span>
  );
};

import React from 'react';
import './AlertBanner.css';

export interface AlertBannerProps {
  title?: string;
  children: React.ReactNode;
  variant?: 'vermilion' | 'sage' | 'ink' | 'neutral';
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  title,
  children,
  variant = 'neutral',
  action,
  icon,
  className = ''
}) => {
  return (
    <div className={`studio-alert studio-alert--${variant} ${className}`}>
      {icon && <span className="studio-alert__icon">{icon}</span>}
      <div className="studio-alert__content">
        {title && <h5 className="studio-alert__title">{title}</h5>}
        <div className="studio-alert__text">{children}</div>
      </div>
      {action && <div className="studio-alert__action">{action}</div>}
    </div>
  );
};

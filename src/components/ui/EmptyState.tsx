import React from 'react';
import { Button } from './Button';
import './EmptyState.css';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'vermilion' | 'secondary' | 'outline' | 'ghost';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  eyebrow = '// ARCHIVAL RECORD EMPTY',
  title,
  description,
  action,
  secondaryAction,
  className = ''
}) => {
  return (
    <div className={`studio-empty-state-card studio-animate-fade-in ${className}`}>
      {icon && <div className="studio-empty-state__icon-wrap">{icon}</div>}
      {eyebrow && <span className="studio-empty-state__eyebrow">{eyebrow}</span>}
      <h3 className="studio-empty-state__title">{title}</h3>
      {description && <p className="studio-empty-state__description">{description}</p>}
      {(action || secondaryAction) && (
        <div className="studio-empty-state__actions">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              iconLeft={action.icon}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="secondary"
              onClick={secondaryAction.onClick}
              iconLeft={secondaryAction.icon}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

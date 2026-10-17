import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Drawer.css';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="studio-drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className={`studio-drawer studio-drawer--${width}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="studio-drawer__header">
          <div>
            <h3 className="studio-drawer__title">{title}</h3>
            {subtitle && <p className="studio-drawer__subtitle">{subtitle}</p>}
          </div>
          <button 
            className="studio-drawer__close-btn" 
            onClick={onClose} 
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>

        <div className="studio-drawer__body">
          {children}
        </div>

        {footer && (
          <div className="studio-drawer__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

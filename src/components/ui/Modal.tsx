import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'md'
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
    <div className="studio-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className={`studio-modal studio-modal--${maxWidth}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="studio-modal__header">
          <div>
            <h3 className="studio-modal__title">{title}</h3>
            {subtitle && <p className="studio-modal__subtitle">{subtitle}</p>}
          </div>
          <button 
            className="studio-modal__close-btn" 
            onClick={onClose} 
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="studio-modal__body">
          {children}
        </div>

        {footer && (
          <div className="studio-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

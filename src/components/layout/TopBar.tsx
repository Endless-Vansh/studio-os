import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Plus, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import './TopBar.css';

interface TopBarProps {
  onMenuToggle: () => void;
  onOpenQuickAction: (type: 'project' | 'deliverable' | 'invoice') => void;
  breadcrumb?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onMenuToggle,
  onOpenQuickAction,
  breadcrumb = 'STUDIO // OVERVIEW'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/deliverables?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="studio-topbar">
      <div className="studio-topbar__left">
        <button 
          className="studio-topbar__hamburger" 
          onClick={onMenuToggle}
          aria-label="Toggle navigation"
        >
          <Menu size={18} />
        </button>
        <div className="studio-topbar__breadcrumb">
          <span className="studio-topbar__crumb-dot" />
          <span className="studio-topbar__crumb-path">{breadcrumb}</span>
        </div>
      </div>

      <div className="studio-topbar__center">
        <div className="studio-topbar__search">
          <Search size={14} className="studio-topbar__search-icon" />
          <input 
            type="text" 
            placeholder="Search deliverables, specs... (press Enter)" 
            className="studio-topbar__search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <kbd className="studio-topbar__search-shortcut">⌘K</kbd>
        </div>
      </div>

      <div className="studio-topbar__right">
        {/* Multi-city Studio Clocks */}
        <div className="studio-topbar__clocks">
          <div className="studio-topbar__clock-item">
            <span className="studio-topbar__clock-bullet">·</span>
            <span className="studio-topbar__clock-label">PARIS 09:45 CET</span>
          </div>
          <div className="studio-topbar__clock-item">
            <span className="studio-topbar__clock-bullet">·</span>
            <span className="studio-topbar__clock-label">ZÜRICH 09:45 CET</span>
          </div>
          <div className="studio-topbar__clock-item studio-topbar__clock-item--active">
            <span className="studio-topbar__time-indicator" />
            <span className="studio-topbar__clock-label">TOKYO 17:45 JST</span>
          </div>
        </div>

        <div className="studio-topbar__actions">
          <Button 
            variant="ghost" 
            size="sm" 
            iconLeft={<Plus size={13} />}
            onClick={() => onOpenQuickAction('invoice')}
          >
            Invoice
          </Button>

          <Button 
            variant="secondary" 
            size="sm" 
            iconLeft={<Plus size={13} />}
            onClick={() => onOpenQuickAction('deliverable')}
          >
            Deliverable
          </Button>

          <Button 
            variant="primary" 
            size="sm" 
            iconLeft={<Plus size={13} />}
            onClick={() => onOpenQuickAction('project')}
          >
            New Project
          </Button>
        </div>
      </div>
    </header>
  );
};

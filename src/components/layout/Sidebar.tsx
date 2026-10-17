import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Compass, 
  FolderKanban, 
  Layers, 
  CheckCircle2, 
  Users, 
  Receipt, 
  Sliders, 
  Sparkles,
  X
} from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingApprovalsCount?: number;
  unpaidInvoicesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  pendingApprovalsCount = 3,
  unpaidInvoicesCount = 2
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="studio-sidebar-backdrop" onClick={onClose} />}

      <aside className={`studio-sidebar ${isOpen ? 'studio-sidebar--open' : ''}`}>
        {/* Brand header */}
        <div className="studio-sidebar__brand">
          <div className="studio-sidebar__logo-group">
            <div className="studio-sidebar__mark" />
            <div className="studio-sidebar__title-wrap">
              <span className="studio-sidebar__title">STUDIO OS</span>
              <span className="studio-sidebar__edition">v2.6 // EDITORIAL</span>
            </div>
          </div>
          <button 
            className="studio-sidebar__mobile-close" 
            onClick={onClose} 
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Agency Studio Meta */}
        <div className="studio-sidebar__agency-pill">
          <div className="studio-sidebar__agency-dot" />
          <div className="studio-sidebar__agency-info">
            <span className="studio-sidebar__agency-name">ATELIER DU MONDE</span>
            <span className="studio-sidebar__agency-locale">PARIS · ZÜRICH · TOKYO</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="studio-sidebar__nav">
          <div className="studio-sidebar__section-label">WORKSPACE</div>
          <NavLink 
            to="/" 
            end 
            className={({ isActive }) => `studio-sidebar__link ${isActive ? 'studio-sidebar__link--active' : ''}`}
            onClick={onClose}
          >
            <Compass size={17} className="studio-sidebar__icon" />
            <span className="studio-sidebar__link-text">Studio Runway</span>
          </NavLink>

          <NavLink 
            to="/projects" 
            className={({ isActive }) => `studio-sidebar__link ${isActive ? 'studio-sidebar__link--active' : ''}`}
            onClick={onClose}
          >
            <FolderKanban size={17} className="studio-sidebar__icon" />
            <span className="studio-sidebar__link-text">Projects & Works</span>
          </NavLink>

          <NavLink 
            to="/deliverables" 
            className={({ isActive }) => `studio-sidebar__link ${isActive ? 'studio-sidebar__link--active' : ''}`}
            onClick={onClose}
          >
            <Layers size={17} className="studio-sidebar__icon" />
            <span className="studio-sidebar__link-text">Deliverables & Specs</span>
          </NavLink>

          <NavLink 
            to="/approvals" 
            className={({ isActive }) => `studio-sidebar__link ${isActive ? 'studio-sidebar__link--active' : ''}`}
            onClick={onClose}
          >
            <CheckCircle2 size={17} className="studio-sidebar__icon" />
            <span className="studio-sidebar__link-text">Client Sign-Offs</span>
            {pendingApprovalsCount > 0 && (
              <span className="studio-sidebar__badge studio-sidebar__badge--vermilion">
                {pendingApprovalsCount}
              </span>
            )}
          </NavLink>

          <div className="studio-sidebar__section-label studio-sidebar__section-label--spaced">FINANCE & CLIENTS</div>

          <NavLink 
            to="/clients" 
            className={({ isActive }) => `studio-sidebar__link ${isActive ? 'studio-sidebar__link--active' : ''}`}
            onClick={onClose}
          >
            <Users size={17} className="studio-sidebar__icon" />
            <span className="studio-sidebar__link-text">Client Roster</span>
          </NavLink>

          <NavLink 
            to="/invoices" 
            className={({ isActive }) => `studio-sidebar__link ${isActive ? 'studio-sidebar__link--active' : ''}`}
            onClick={onClose}
          >
            <Receipt size={17} className="studio-sidebar__icon" />
            <span className="studio-sidebar__link-text">Invoices & Ledger</span>
            {unpaidInvoicesCount > 0 && (
              <span className="studio-sidebar__badge studio-sidebar__badge--neutral">
                {unpaidInvoicesCount}
              </span>
            )}
          </NavLink>
        </nav>

        {/* Studio Capacity & Profile footer */}
        <div className="studio-sidebar__footer">
          <div className="studio-sidebar__capacity-card">
            <div className="studio-sidebar__capacity-header">
              <span className="studio-sidebar__capacity-label">CAPACITY ALLOCATION</span>
              <span className="studio-sidebar__capacity-pct">78%</span>
            </div>
            <div className="studio-sidebar__capacity-track-wrap">
              <ProgressBar percent={78} variant="vermilion" delay={320} height={4} />
            </div>
            <div className="studio-sidebar__capacity-sub">4 ACTIVE MONOGRAPHS & IDENTITIES</div>
          </div>

          <div className="studio-sidebar__user">
            <div className="studio-sidebar__avatar">MV</div>
            <div className="studio-sidebar__user-details">
              <span className="studio-sidebar__user-name">Mathilde Vane</span>
              <span className="studio-sidebar__user-role">Creative Director</span>
            </div>
            <Sparkles size={14} className="studio-sidebar__sparkle" />
          </div>
        </div>
      </aside>
    </>
  );
};

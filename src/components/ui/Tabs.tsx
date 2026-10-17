import React from 'react';
import './Tabs.css';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = ''
}) => {
  return (
    <div className={`studio-tabs ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            className={`studio-tab ${isActive ? 'studio-tab--active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            <span className="studio-tab__label">{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`studio-tab__count ${isActive ? 'studio-tab__count--active' : ''}`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

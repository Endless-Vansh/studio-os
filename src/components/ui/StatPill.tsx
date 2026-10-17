import React from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import { ProgressBar } from './ProgressBar';
import './StatPill.css';

export interface StatPillProps {
  label: string;
  value?: string | number;
  animatedNumber?: {
    value: number;
    prefix?: string;
    suffix?: string;
    duration?: number;
  };
  subtext?: string;
  accent?: 'default' | 'vermilion' | 'sage' | 'ink';
  badge?: {
    text: string;
    variant?: 'sage' | 'vermilion' | 'neutral';
  };
  icon?: React.ReactNode;
  progressPercent?: number;
  progressVariant?: 'sage' | 'vermilion' | 'ink';
  progressDelay?: number;
  hasBullet?: boolean;
  className?: string;
}

export const StatPill: React.FC<StatPillProps> = ({
  label,
  value,
  animatedNumber,
  subtext,
  accent = 'default',
  badge,
  icon,
  progressPercent,
  progressVariant = 'sage',
  progressDelay = 220,
  hasBullet = false,
  className = ''
}) => {
  return (
    <div className={`studio-stat-pill studio-stat-pill--${accent} ${className}`}>
      <div className="studio-stat-pill__header">
        <span className="studio-stat-pill__label">{label}</span>
        {icon && <span className="studio-stat-pill__icon">{icon}</span>}
      </div>

      <div className="studio-stat-pill__value-row">
        <span className="studio-stat-pill__value">
          {animatedNumber ? (
            <AnimatedNumber 
              value={animatedNumber.value}
              prefix={animatedNumber.prefix}
              suffix={animatedNumber.suffix}
              duration={animatedNumber.duration || 950}
            />
          ) : (
            value
          )}
        </span>
        {badge && (
          <span className={`studio-stat-pill__badge studio-stat-pill__badge--${badge.variant || 'neutral'}`}>
            {badge.text}
          </span>
        )}
      </div>

      {typeof progressPercent === 'number' && (
        <div className="studio-stat-pill__progress-wrap">
          <ProgressBar 
            percent={progressPercent}
            variant={progressVariant}
            delay={progressDelay}
            height={4}
          />
        </div>
      )}

      {subtext && (
        <div className="studio-stat-pill__subtext">
          {hasBullet && <span className="studio-stat-pill__bullet" />}
          <span>{subtext}</span>
        </div>
      )}
    </div>
  );
};

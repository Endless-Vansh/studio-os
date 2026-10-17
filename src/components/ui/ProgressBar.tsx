import React, { useEffect, useState } from 'react';
import './ProgressBar.css';

export interface ProgressBarProps {
  percent: number;
  variant?: 'sage' | 'vermilion' | 'ink';
  height?: number | string;
  delay?: number;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  variant = 'sage',
  height = 4,
  delay = 180,
  className = ''
}) => {
  const [filledPercent, setFilledPercent] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return percent;
    }
    return 0;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFilledPercent(percent);
      return;
    }

    const timer = setTimeout(() => {
      setFilledPercent(percent);
    }, delay);

    return () => clearTimeout(timer);
  }, [percent, delay]);

  return (
    <div 
      className={`studio-progress-track ${className}`}
      style={{ height }}
    >
      <div 
        className={`studio-progress-fill studio-progress-fill--${variant}`}
        style={{ width: `${Math.min(100, Math.max(0, filledPercent))}%` }}
      />
    </div>
  );
};

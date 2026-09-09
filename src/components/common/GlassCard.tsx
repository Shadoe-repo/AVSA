import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  isElevated?: boolean;
  isCritical?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  isElevated = false,
  isCritical = false,
  onClick
}) => {
  const baseClass = isElevated ? 'crystal-panel-elevated' : 'crystal-card';
  const criticalClass = isCritical ? 'crystal-critical' : '';

  return (
    <div
      onClick={onClick}
      className={`${baseClass} ${criticalClass} p-5 text-[var(--text-primary)] ${onClick ? 'cursor-pointer hover:scale-[1.008] transition-transform duration-200' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

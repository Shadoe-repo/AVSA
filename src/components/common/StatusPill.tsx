import React from 'react';
import { EmergencySeverity, EmergencyStatus } from '../../types';

interface StatusPillProps {
  status?: EmergencyStatus;
  severity?: EmergencySeverity;
  label?: string;
  isLive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  severity,
  label,
  isLive = false,
  size = 'md'
}) => {
  let bgColor = 'rgba(255, 255, 255, 0.10)';
  let borderColor = 'rgba(255, 255, 255, 0.22)';
  let textColor = '#F7FAFC';
  let pulseClass = '';

  if (severity === 'CRITICAL') {
    bgColor = 'rgba(255, 69, 58, 0.18)';
    borderColor = 'rgba(255, 69, 58, 0.7)';
    textColor = '#FF453A';
    pulseClass = 'animate-pulse';
  } else if (severity === 'HIGH') {
    bgColor = 'rgba(255, 159, 10, 0.18)';
    borderColor = 'rgba(255, 159, 10, 0.7)';
    textColor = '#FF9F0A';
  } else if (severity === 'MODERATE') {
    bgColor = 'rgba(255, 214, 10, 0.18)';
    borderColor = 'rgba(255, 214, 10, 0.7)';
    textColor = '#FFD60A';
  } else if (severity === 'LOW') {
    bgColor = 'rgba(48, 209, 88, 0.18)';
    borderColor = 'rgba(48, 209, 88, 0.7)';
    textColor = '#30D158';
  }

  if (status === 'ARRIVED' || status === 'COMPLETED') {
    bgColor = 'rgba(48, 209, 88, 0.18)';
    borderColor = 'rgba(48, 209, 88, 0.7)';
    textColor = '#30D158';
  } else if (status === 'EN_ROUTE') {
    bgColor = 'rgba(10, 132, 255, 0.18)';
    borderColor = 'rgba(10, 132, 255, 0.7)';
    textColor = '#0A84FF';
  } else if (status === 'APPROACHING') {
    bgColor = 'rgba(191, 90, 242, 0.18)';
    borderColor = 'rgba(191, 90, 242, 0.7)';
    textColor = '#BF5AF2';
  }

  const displayText = label || severity || status || 'NORMAL';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 font-semibold'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full uppercase font-medium border backdrop-blur-md ${sizeClasses} ${pulseClass}`}
      style={{ backgroundColor: bgColor, borderColor, color: textColor }}
    >
      {isLive && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping opacity-75" />
      )}
      <span>{displayText}</span>
    </span>
  );
};

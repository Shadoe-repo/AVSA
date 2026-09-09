import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'critical' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  let variantStyle = 'crystal-btn-primary';
  if (variant === 'secondary') {
    variantStyle = 'crystal-btn-secondary';
  } else if (variant === 'critical') {
    variantStyle = 'bg-red-600/80 hover:bg-red-600/90 text-white border border-red-400/40 shadow-lg shadow-red-900/30';
  } else if (variant === 'ghost') {
    variantStyle = 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-transparent hover:border-white/20';
  }

  const sizeStyle = {
    sm: 'h-9 px-3 text-xs rounded-xl gap-1.5',
    md: 'h-11 px-4 text-sm rounded-2xl gap-2',
    lg: 'h-14 px-6 text-base font-semibold rounded-2xl gap-2.5'
  }[size];

  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variantStyle} ${sizeStyle} ${className}`}
      {...props}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {children}
    </button>
  );
};

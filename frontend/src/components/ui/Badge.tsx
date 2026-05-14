import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'primary' | 'gray' | 'info';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'gray',
  children,
  className,
  dot = false,
}) => {
  const variantClass = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    primary: 'badge-primary',
    gray: 'badge-gray',
    info: 'badge-info',
  }[variant];

  return (
    <span className={cn('badge', variantClass, className)}>
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'currentColor' }}
        />
      )}
      {children}
    </span>
  );
};

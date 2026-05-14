import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => (
  <div
    className={`${sizeMap[size]} border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin ${className || ''}`}
    role="status"
    aria-label="Loading"
  />
);

export const PageSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <Spinner size="lg" />
  </div>
);

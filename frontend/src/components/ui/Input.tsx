import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  className,
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 w-4 h-4">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={cn('input', leftIcon ? 'pl-10' : '', error ? 'border-red-400' : '', className)}
          {...props}
        />
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
};

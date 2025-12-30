import React from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  multiline?: boolean;
  rows?: number;
}

export function Input({ label, error, helperText, multiline, rows, className, ...props }: InputProps) {
  const inputClasses = clsx(
    'w-full px-4 py-2 border rounded-lg transition-colors',
    'focus:ring-2 focus:ring-primary-500 focus:border-transparent',
    error
      ? 'border-red-300 focus:ring-red-500'
      : 'border-gray-300',
    props.disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {multiline ? (
        <textarea
          rows={rows || 3}
          className={inputClasses}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={inputClasses}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export default Input;


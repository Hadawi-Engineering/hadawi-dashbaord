import React from 'react';
import clsx from 'clsx';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  color?: 'gray' | 'red' | 'green' | 'blue' | 'yellow' | 'purple';
  variant?: 'default' | 'success' | 'secondary' | 'destructive';
}

export function Badge({ children, color = 'gray', variant, className, ...props }: BadgeProps) {
  const colors = {
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    secondary: 'bg-gray-100 text-gray-600',
    destructive: 'bg-red-100 text-red-800',
  };
  
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant ? variants[variant] : colors[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;


import React from 'react';
import { cn } from '@/lib/utils';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'md';
  asChild?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants: Record<string, string> = {
      default: 'bg-brand-600 text-white hover:bg-brand-700',
      outline: 'border border-gray-300 hover:bg-gray-50',
      ghost: 'hover:bg-gray-100',
      secondary: 'bg-gray-200 text-gray-800',
    };
    const sizes: Record<string, string> = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2',
    };
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded transition-colors disabled:opacity-50',
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';


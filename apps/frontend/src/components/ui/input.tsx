import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-300',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';


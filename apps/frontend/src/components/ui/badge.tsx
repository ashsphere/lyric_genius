import React from 'react';
import { cn } from '@/lib/utils';

type Props = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'secondary' | 'outline';
};

export const Badge: React.FC<Props> = ({ className, variant = 'default', ...props }) => {
  const variants: Record<string, string> = {
    default: 'bg-brand-600 text-white',
    secondary: 'bg-gray-200 text-gray-800',
    outline: 'border border-gray-300',
  };
  return <span className={cn('inline-block px-2 py-0.5 rounded text-xs', variants[variant], className)} {...props} />;
};


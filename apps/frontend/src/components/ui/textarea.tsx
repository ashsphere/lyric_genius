import React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-300',
      className,
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';


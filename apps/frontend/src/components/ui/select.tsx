import React from 'react';
import { cn } from '@/lib/utils';

type SelectContextType = {
  open: boolean;
  setOpen: (v: boolean) => void;
  value: string;
  setValue: (v: string) => void;
};

const SelectContext = React.createContext<SelectContextType | null>(null);

type SelectRootProps = {
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
};

export const Select: React.FC<SelectRootProps> = ({ value, onValueChange, children, className }) => {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState(value ?? '');
  React.useEffect(() => setInternalValue(value ?? ''), [value]);

  const setValue = (v: string) => {
    setInternalValue(v);
    onValueChange?.(v);
    setOpen(false);
  };

  return (
    <SelectContext.Provider value={{ open, setOpen, value: internalValue, setValue }}>
      <div className={cn('relative w-full', className)}>{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  children,
  ...props
}) => {
  const ctx = React.useContext(SelectContext)!;
  return (
    <button
      type="button"
      className={cn('w-full rounded border border-gray-300 bg-white px-3 py-2 text-left', className)}
      onClick={() => ctx.setOpen(!ctx.open)}
      {...props}
    >
      {children}
    </button>
  );
};

export const SelectValue: React.FC<{ placeholder?: string; value?: string }> = ({
  placeholder,
  value,
}) => <span className={cn(!value && 'text-gray-500')}>{value || placeholder}</span>;

export const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  const ctx = React.useContext(SelectContext)!;
  if (!ctx.open) return null;
  return (
    <div className={cn('absolute z-50 mt-1 w-full rounded border bg-white shadow', className)} {...props}>
      {children}
    </div>
  );
};

export const SelectItem: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string; onSelect?: (v: string) => void }
> = ({ className, children, value, onSelect, ...props }) => {
  const ctx = React.useContext(SelectContext)!;
  const handle = () => {
    ctx.setValue(value);
    onSelect?.(value);
  };
  return (
    <button
      type="button"
      className={cn('block w-full px-3 py-2 text-left hover:bg-gray-50', className)}
      onClick={handle}
      {...props}
    >
      {children}
    </button>
  );
};

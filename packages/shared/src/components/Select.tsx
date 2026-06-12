import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  id?: string;
}

export function Select({
  value,
  options,
  onChange,
  placeholder,
  disabled,
  className = '',
  required,
  id,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className="w-full flex items-center gap-2 bg-bg-raised border border-border outline-none rounded-xl px-3 py-2 text-xs font-sans text-text-body hover:border-border-hover focus:bg-bg-surface focus:ring-2 focus:ring-brand/10 transition-all cursor-pointer disabled:opacity-50"
      >
        <span className="flex-1 text-left truncate">
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`h-3 w-3 text-text-faint shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div
          style={{ maxHeight: '13.5rem', overflowY: 'auto' }}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-bg-surface border border-border rounded-xl shadow-lg">
          {placeholder && (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 text-xs font-medium text-text-muted hover:bg-bg-raised transition-colors cursor-pointer"
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2.5 text-xs font-medium transition-colors cursor-pointer ${
                opt.value === value
                  ? 'text-brand font-semibold bg-brand/5'
                  : 'text-text-body hover:bg-bg-raised'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
      {required && (
        <input
          tabIndex={-1}
          className="sr-only"
          required
          value={value || ''}
          onChange={() => {}}
        />
      )}
    </div>
  );
}

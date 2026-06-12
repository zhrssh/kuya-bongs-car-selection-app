import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

interface SortDropdownProps {
  value: string;
  options: SortOption[];
  onChange: (value: string) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ value, options, onChange }) => {
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
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 bg-bg-raised border border-border rounded-full py-1.5 pl-8 pr-3 text-xs font-medium text-text-body outline-none hover:border-border-hover focus:bg-bg-surface focus:ring-2 focus:ring-brand/20 transition-all cursor-pointer"
      >
        <ArrowUpDown className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-faint pointer-events-none" />
        <span className="flex-1 text-left truncate">{selected?.label || value}</span>
        <svg
          className={`h-3 w-3 text-text-faint transition-transform ${open ? 'rotate-180' : ''}`}
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
        <div className="absolute top-full left-0 right-0 z-50 mt-1.5 bg-bg-surface border border-border rounded-xl shadow-lg overflow-hidden">
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
    </div>
  );
};

import { ChevronDown, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Option = {
  label: string;
  value: string;
};

type CustomDropdownProps = {
  label?: string;
  value: string;
  options: Option[];
  placeholder?: string;
  searchPlaceholder?: string;
  onChange: (value: string) => void;
  onCreateOption?: (value: string) => Promise<void> | void;
  disabled?: boolean;
  isDark?: boolean;
};

export function CustomDropdown({
  label,
  value,
  options,
  placeholder = 'Select option',
  searchPlaceholder = 'Search...',
  onChange,
  onCreateOption,
  disabled = false,
  isDark = false,
}: CustomDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, search]);

  const selected = options.find((option) => option.value === value);
  const canCreate = Boolean(onCreateOption) && search.trim().length > 0 && !options.some((option) => option.label.toLowerCase() === search.trim().toLowerCase());

  return (
    <div ref={rootRef} className="relative w-full">
      {label ? <p className={`mb-1.5 text-xs sm:text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{label}</p> : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((state) => !state)}
        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 sm:py-2.5 text-left text-xs sm:text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
          isDark
            ? 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-lime-400'
            : 'border-zinc-300 bg-white text-zinc-900 hover:border-lime-500'
        }`}
        style={{ colorScheme: isDark ? 'dark' : 'light' }}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown size={16} className={open ? 'rotate-180 transition' : 'transition'} />
      </button>

      {open ? (
        <div className={`absolute z-40 mt-2 w-full rounded-xl border p-2 shadow-2xl ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900'}`}>
          <div className={`mb-2 flex items-center gap-2 rounded-lg border px-2 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'}`}>
            <Search size={14} className={isDark ? 'text-zinc-400' : 'text-zinc-500'} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className={`w-full bg-transparent py-2 text-xs sm:text-sm outline-none placeholder:text-zinc-500 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
            />
          </div>

          <div className="max-h-52 overflow-y-auto">
            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`mb-1 flex w-full items-center rounded-lg px-2 py-2 text-xs sm:text-sm transition ${
                  option.value === value
                    ? 'bg-lime-400/20 text-lime-700 dark:text-lime-300'
                    : isDark
                      ? 'text-zinc-200 hover:bg-zinc-800'
                      : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {option.label}
              </button>
            ))}

            {filtered.length === 0 ? (
              <p className="px-2 py-2 text-xs sm:text-sm text-zinc-500">No results found</p>
            ) : null}
          </div>

          {canCreate ? (
            <button
              type="button"
              disabled={creating}
              onClick={async () => {
                if (!onCreateOption) return;
                setCreating(true);
                try {
                  await onCreateOption(search.trim());
                  onChange(search.trim());
                  setSearch('');
                  setOpen(false);
                } finally {
                  setCreating(false);
                }
              }}
              className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-lime-400/40 px-2 py-2 text-xs sm:text-sm font-medium transition disabled:opacity-50 ${isDark ? 'bg-lime-400/10 text-lime-300 hover:bg-lime-400/20' : 'bg-lime-100 text-lime-700 hover:bg-lime-200'}`}
            >
              <Plus size={14} />
              {creating ? 'Adding...' : `Add "${search.trim()}"`}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

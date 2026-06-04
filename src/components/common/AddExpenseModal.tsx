import { X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CustomDropdown } from './CustomDropdown';

type AddExpenseModalProps = {
  isOpen: boolean;
  isDark: boolean;
  categories: string[];
  isPending: boolean;
  onClose: () => void;
  onCreateCategory: (name: string) => Promise<void> | void;
  onSubmit: (payload: { amount: string; category: string; note: string; date: string }) => void;
  defaultDate?: string;
};

export function AddExpenseModal({
  isOpen,
  isDark,
  categories,
  isPending,
  onClose,
  onCreateCategory,
  onSubmit,
  defaultDate,
}: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0] ?? 'Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().slice(0, 10));

  const options = useMemo(() => categories.map((item) => ({ label: item, value: item })), [categories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 sm:p-6" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className={`w-full max-w-xs sm:max-w-sm md:max-w-xl rounded-2xl border p-4 sm:p-6 shadow-2xl ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900'}`}
      >
        <div className="mb-4 sm:mb-5 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold">Add Expense</h2>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-1 transition ${isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-3 sm:gap-4">
          <div>
            <label className={`mb-1.5 block text-xs sm:text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Amount (INR)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={`w-full rounded-xl border px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-400' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
            />
          </div>

          <CustomDropdown
            label="Category"
            value={category}
            options={options}
            placeholder="Select category"
            onChange={setCategory}
            onCreateOption={onCreateCategory}
            searchPlaceholder="Search or add category"
            isDark={isDark}
          />

          <div>
            <label className={`mb-1.5 block text-xs sm:text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={`w-full rounded-xl border px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-400' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
            />
          </div>

          <div>
            <label className={`mb-1.5 block text-xs sm:text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Note (Optional)</label>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className={`w-full rounded-xl border px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-400' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
            />
          </div>
        </div>

        <div className="mt-5 sm:mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-xl border px-4 py-2 text-xs sm:text-sm font-semibold transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500' : 'border-zinc-300 bg-zinc-100 text-zinc-700 hover:border-zinc-400'}`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending || !amount || Number(amount) <= 0}
            onClick={() => {
              onSubmit({ amount, category, note, date });
              setAmount('');
              setNote('');
            }}
            className="rounded-xl bg-lime-300 px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-950 transition hover:bg-lime-200 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { CustomDropdown } from '../common/CustomDropdown';

type ExpenseEntrySectionProps = {
  categories: string[];
  isDark: boolean;
  isPending: boolean;
  onCreateCategory: (name: string) => Promise<void> | void;
  onSubmit: (payload: { amount: string; category: string; note: string; date: string }) => void;
};

export function ExpenseEntrySection({
  categories,
  isDark,
  isPending,
  onCreateCategory,
  onSubmit,
}: ExpenseEntrySectionProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0] ?? 'Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const options = useMemo(() => categories.map((item) => ({ label: item, value: item })), [categories]);

  return (
    <section className={`mx-auto w-full max-w-3xl rounded-2xl border p-4 sm:p-6 shadow-xl transition-all duration-300 ${isDark ? 'border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl' : 'border-zinc-300 bg-white text-zinc-900'}`}>
      <div className="mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight">Add Expense</h2>
        <p className={`mt-1 text-xs sm:text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Add expense with date and searchable category picker.</p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="sm:col-span-1">
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

        <div className="sm:col-span-1">
          <label className={`mb-1.5 block text-xs sm:text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Date</label>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={`w-full rounded-xl border px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-400' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
            style={{ colorScheme: isDark ? 'dark' : 'light' }}
          />
        </div>

        <div className="sm:col-span-2">
          <CustomDropdown
            label="Category"
            value={category}
            options={options}
            placeholder="Select category"
            searchPlaceholder="Search or add category"
            onChange={setCategory}
            onCreateOption={onCreateCategory}
            isDark={isDark}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={`mb-1.5 block text-xs sm:text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Note (Optional)</label>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className={`w-full rounded-xl border px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-400' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
            style={{ colorScheme: isDark ? 'dark' : 'light' }}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={isPending || !amount || Number(amount) <= 0}
          onClick={() => {
            onSubmit({ amount, category, note, date });
            setAmount('');
            setNote('');
          }}
          className="rounded-xl bg-lime-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-lime-200 disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Expense'}
        </button>
      </div>
    </section>
  );
}

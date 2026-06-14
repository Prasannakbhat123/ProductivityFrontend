import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CustomDropdown } from './CustomDropdown';
import {
  DEFAULT_INCOME_SOURCES,
  TRANSACTION_TYPE_OPTIONS,
  type TransactionEntryType,
} from '../../lib/transactionEntry';

type AddExpenseModalProps = {
  isOpen: boolean;
  isDark: boolean;
  categories: string[];
  isPending: boolean;
  defaultEntryType?: TransactionEntryType;
  onClose: () => void;
  onCreateCategory: (name: string) => Promise<void> | void;
  onSubmitExpense: (payload: { amount: string; category: string; title: string; note: string; date: string }) => void;
  onSubmitIncome: (payload: { amount: string; source: string; note: string; date: string }) => void;
  defaultDate?: string;
};

export function AddExpenseModal({
  isOpen,
  isDark,
  categories,
  isPending,
  defaultEntryType = 'expense',
  onClose,
  onCreateCategory,
  onSubmitExpense,
  onSubmitIncome,
  defaultDate,
}: AddExpenseModalProps) {
  const [entryType, setEntryType] = useState<TransactionEntryType>(defaultEntryType);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0] ?? 'Food');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState(DEFAULT_INCOME_SOURCES[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().slice(0, 10));

  const categoryOptions = useMemo(() => categories.map((item) => ({ label: item, value: item })), [categories]);
  const sourceOptions = useMemo(
    () => DEFAULT_INCOME_SOURCES.map((item) => ({ label: item, value: item })),
    [],
  );

  useEffect(() => {
    if (!isOpen) return;
    setEntryType(defaultEntryType);
    setDate(defaultDate ?? new Date().toISOString().slice(0, 10));
  }, [isOpen, defaultEntryType, defaultDate]);

  const isIncome = entryType === 'income';
  const inputClass = `w-full rounded-xl border px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-400' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`;
  const submitClass =
    'rounded-xl bg-lime-300 px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-950 transition hover:bg-lime-200 disabled:opacity-50';

  if (!isOpen) return null;

  const resetFields = () => {
    setAmount('');
    setTitle('');
    setNote('');
  };

  const handleSubmit = () => {
    if (isIncome) {
      onSubmitIncome({ amount, source, note, date });
    } else {
      onSubmitExpense({ amount, category, title, note, date });
    }
    resetFields();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 sm:p-6" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className={`w-full max-w-xs sm:max-w-sm md:max-w-xl rounded-2xl border p-4 sm:p-6 shadow-2xl ${isDark ? 'border-zinc-700 bg-zinc-950 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900'}`}
      >
        <div className="mb-4 sm:mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">Record transaction</h2>
            <p className={`mt-0.5 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
              {isIncome
                ? 'One-time deposit only. Monthly salary is set under Manage → Monthly Salary.'
                : 'Spending for a category on the date you choose.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg p-1 transition ${isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-3 sm:gap-4">
          <CustomDropdown
            label="Transaction type"
            value={entryType}
            options={TRANSACTION_TYPE_OPTIONS}
            placeholder="Select type"
            onChange={(value) => setEntryType(value as TransactionEntryType)}
            isDark={isDark}
          />

          <div>
            <label className={`mb-1.5 block text-xs sm:text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Amount (INR)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={inputClass}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
            />
          </div>

          {isIncome ? (
            <CustomDropdown
              label="Income source"
              value={source}
              options={sourceOptions}
              placeholder="Select source"
              onChange={setSource}
              onCreateOption={(name) => setSource(name)}
              searchPlaceholder="Search or add source"
              isDark={isDark}
            />
          ) : (
            <>
              <CustomDropdown
                label="Category"
                value={category}
                options={categoryOptions}
                placeholder="Select category"
                onChange={setCategory}
                onCreateOption={onCreateCategory}
                searchPlaceholder="Search or add category"
                isDark={isDark}
              />
              <div>
                <label className={`mb-1.5 block text-xs sm:text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Title (optional)
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Groceries run, Uber to airport"
                  className={inputClass}
                />
              </div>
            </>
          )}

          <div>
            <label className={`mb-1.5 block text-xs sm:text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Date</label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputClass}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
            />
          </div>

          <div>
            <label className={`mb-1.5 block text-xs sm:text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Note (optional)</label>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={isIncome ? 'e.g. Client invoice, June salary' : undefined}
              className={inputClass}
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
            onClick={handleSubmit}
            className={submitClass}
          >
            {isPending ? 'Saving...' : isIncome ? 'Save income' : 'Save expense'}
          </button>
        </div>
      </div>
    </div>
  );
}

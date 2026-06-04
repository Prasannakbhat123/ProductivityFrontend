import { useEffect, useState } from 'react';
import type { Expense } from '../../types/finance';

type ExpenseEditorModalProps = {
  expense: Expense;
  onClose: () => void;
  onSubmit: (payload: { id: string; amountRupees: number; category: string; note: string }) => void;
  isSubmitting: boolean;
};

export function ExpenseEditorModal({ expense, onClose, onSubmit, isSubmitting }: ExpenseEditorModalProps) {
  const [amountInput, setAmountInput] = useState(String(expense.amountRupees));
  const [category, setCategory] = useState(expense.category);
  const [note, setNote] = useState(expense.note ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    setAmountInput(String(expense.amountRupees));
    setCategory(expense.category);
    setNote(expense.note ?? '');
    setError('');
  }, [expense]);

  const handleSubmit = () => {
    const parsed = Number(amountInput);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError('Amount should be greater than 0.');
      return;
    }

    if (!category.trim()) {
      setError('Category is required.');
      return;
    }

    onSubmit({
      id: expense._id,
      amountRupees: Number(parsed.toFixed(2)),
      category: category.trim(),
      note: note.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 sm:p-6" role="presentation" onClick={onClose}>
      <div
        className="w-full max-w-xs sm:max-w-sm md:max-w-xl rounded-2xl border border-zinc-300 bg-white p-4 sm:p-6 text-zinc-900 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg sm:text-xl font-bold">Edit Expense</h3>
        <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">Update amount, category, or note for this entry.</p>

        <label className="mt-3 sm:mt-4 mb-1.5 block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="expense-amount">
          Amount (INR)
        </label>
        <input
          id="expense-amount"
          value={amountInput}
          onChange={(event) => setAmountInput(event.target.value)}
          placeholder="0"
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none transition focus:border-lime-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-lime-400"
        />

        <label className="mt-3 sm:mt-4 mb-1.5 block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="expense-category">
          Category
        </label>
        <input
          id="expense-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Category"
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none transition focus:border-lime-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-lime-400"
        />

        <label className="mt-3 sm:mt-4 mb-1.5 block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300" htmlFor="expense-note">
          Note
        </label>
        <input
          id="expense-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Optional note"
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none transition focus:border-lime-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-lime-400"
        />

        {error ? <p className="mt-2 text-xs sm:text-sm text-red-500 dark:text-red-300">{error}</p> : null}

        <div className="mt-5 sm:mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-500"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-lime-300 px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-950 transition hover:bg-lime-200 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

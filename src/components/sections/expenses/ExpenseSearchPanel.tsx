import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { formatCurrencyFromRupees, formatDateKeyDisplay } from '../../../lib/format';
import type { Expense } from '../../../types/finance';
import { PaginationControls } from '../../common/PaginationControls';

type ExpenseSearchPanelProps = {
  monthKey: string;
  isDark: boolean;
  categories: string[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
};

const PAGE_SIZE = 20;

export function ExpenseSearchPanel({ monthKey, isDark, categories, onEditExpense, onDeleteExpense }: ExpenseSearchPanelProps) {
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [monthKey, category, note, minAmount, maxAmount]);

  const expensesQuery = useQuery({
    queryKey: ['expenses-search', monthKey, category, note, minAmount, maxAmount, page],
    queryFn: () =>
      api.getExpenses({
        monthKey,
        category: category || undefined,
        note: note || undefined,
        minAmount: minAmount === '' ? undefined : Number(minAmount),
        maxAmount: maxAmount === '' ? undefined : Number(maxAmount),
        page,
        limit: PAGE_SIZE,
      }),
  });

  const result = expensesQuery.data;
  const items = result?.items ?? [];

  const cardBase = isDark
    ? 'rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl'
    : 'rounded-2xl border border-zinc-300 bg-white p-4 shadow-lg';

  const inputClass = isDark
    ? 'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-lime-300'
    : 'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-lime-500';

  return (
    <article className={cardBase}>
      <h3 className={`mb-3 text-base font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
        Search &amp; Filter Expenses
      </h3>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1">
          <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} style={{ colorScheme: isDark ? 'dark' : 'light' }}>
            <option value="">All categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Note contains</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} placeholder="Search note text..." />
        </label>
        <label className="space-y-1">
          <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Min amount (₹)</span>
          <input type="number" min={0} value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className={inputClass} />
        </label>
        <label className="space-y-1">
          <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Max amount (₹)</span>
          <input type="number" min={0} value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className={inputClass} />
        </label>
      </div>

      {expensesQuery.isLoading ? (
        <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Loading expenses...</p>
      ) : null}
      {expensesQuery.isError ? (
        <p className="text-sm text-red-500">Failed to load expenses. Check backend connection.</p>
      ) : null}

      <div className="space-y-2">
        {items.map((expense) => (
          <div
            key={expense._id}
            className={`flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'}`}
          >
            <div>
              <p className={`text-sm font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                {expense.category} · {formatCurrencyFromRupees(expense.amountRupees)}
              </p>
              <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                {formatDateKeyDisplay(expense.dateKey)}
                {expense.note ? ` · ${expense.note}` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEditExpense(expense)}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold ${isDark ? 'border-zinc-700 text-zinc-200 hover:border-lime-300' : 'border-zinc-300 text-zinc-700 hover:border-lime-500'}`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDeleteExpense(expense._id)}
                className={`rounded-lg border px-3 py-1 text-xs font-semibold ${isDark ? 'border-red-800 text-red-300 hover:bg-red-950' : 'border-red-300 text-red-700 hover:bg-red-50'}`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!expensesQuery.isLoading && items.length === 0 ? (
          <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>No expenses match these filters.</p>
        ) : null}
      </div>

      {result ? (
        <div className="mt-4">
          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            isDark={isDark}
            onPageChange={setPage}
          />
        </div>
      ) : null}
    </article>
  );
}

import { addMonths, format, subMonths } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { formatCurrencyFromRupees, formatDateKeyDisplay, formatDateTimeDisplay } from '../../lib/format';
import { PaginationControls } from '../common/PaginationControls';
import { ACTIVITY_ENTITY_TYPES } from '../../types/activity';

type LogsSectionProps = {
  monthDate: Date;
  onChangeMonthDate: (date: Date) => void;
  isDark: boolean;
  categories: string[];
};

const PAGE_SIZE = 25;

function actionBadgeClass(action: string, isDark: boolean): string {
  if (action.includes('deleted')) {
    return isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-800';
  }
  if (action.includes('created') || action.includes('updated') || action.includes('completed')) {
    return isDark ? 'bg-lime-900/40 text-lime-300' : 'bg-lime-100 text-lime-800';
  }
  return isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700';
}

export function LogsSection({ monthDate, onChangeMonthDate, isDark, categories }: LogsSectionProps) {
  const monthKey = format(monthDate, 'yyyy-MM');
  const monthLabel = format(monthDate, 'MMMM yyyy');
  const monthInputValue = format(monthDate, 'yyyy-MM');

  const [dateKey, setDateKey] = useState('');
  const [category, setCategory] = useState('');
  const [entityType, setEntityType] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [monthKey, dateKey, category, entityType, search]);

  const logsQuery = useQuery({
    queryKey: ['activity-logs', monthKey, dateKey, category, entityType, search, page],
    queryFn: () =>
      api.getActivityLogs({
        monthKey,
        dateKey: dateKey || undefined,
        category: category || undefined,
        entityType: entityType || undefined,
        search: search || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  });

  const result = logsQuery.data;
  const items = result?.items ?? [];

  const cardBase = isDark
    ? 'rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl'
    : 'rounded-2xl border border-zinc-300 bg-white p-4 shadow-lg';

  const inputClass = isDark
    ? 'w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-lime-300'
    : 'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-lime-500';

  return (
    <section className="space-y-4">
      <article className={`${cardBase} p-4 sm:p-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              Activity logs
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
              Every expense, income, budget, goal, and settings change for {monthLabel}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeMonthDate(subMonths(monthDate, 1))}
              className={`rounded-lg border px-2 py-1 text-xs transition ${isDark ? 'border-zinc-700 text-zinc-200 hover:border-lime-300' : 'border-zinc-300 text-zinc-700 hover:border-lime-500'}`}
            >
              Prev
            </button>
            <span className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>{monthLabel}</span>
            <button
              type="button"
              onClick={() => onChangeMonthDate(addMonths(monthDate, 1))}
              className={`rounded-lg border px-2 py-1 text-xs transition ${isDark ? 'border-zinc-700 text-zinc-200 hover:border-lime-300' : 'border-zinc-300 text-zinc-700 hover:border-lime-500'}`}
            >
              Next
            </button>
            <input
              type="month"
              value={monthInputValue}
              onChange={(event) => onChangeMonthDate(new Date(`${event.target.value}-01T12:00:00.000Z`))}
              className={`rounded-lg border px-2 py-1 text-xs outline-none ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900'}`}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
            />
          </div>
        </div>
      </article>

      <article className={cardBase}>
        <h3 className={`mb-3 text-base font-extrabold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Filters</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-1">
            <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Date</span>
            <input
              type="date"
              value={dateKey}
              onChange={(event) => setDateKey(event.target.value)}
              className={inputClass}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
            />
          </label>
          <label className="space-y-1">
            <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Category</span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={inputClass}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
            >
              <option value="">All categories</option>
              {categories.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Type</span>
            <select
              value={entityType}
              onChange={(event) => setEntityType(event.target.value)}
              className={inputClass}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
            >
              {ACTIVITY_ENTITY_TYPES.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 sm:col-span-2 lg:col-span-1">
            <span className={`text-xs font-semibold ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Search message</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="e.g. Food, Freelance..."
              className={inputClass}
            />
          </label>
        </div>
        {(dateKey || category || entityType || search) ? (
          <button
            type="button"
            onClick={() => {
              setDateKey('');
              setCategory('');
              setEntityType('');
              setSearch('');
            }}
            className={`mt-3 rounded-lg border px-3 py-1.5 text-xs font-semibold ${isDark ? 'border-zinc-700 text-zinc-200 hover:border-lime-300' : 'border-zinc-300 text-zinc-700 hover:border-lime-500'}`}
          >
            Clear filters
          </button>
        ) : null}
      </article>

      <article className={cardBase}>
        <h3 className={`mb-3 text-base font-extrabold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Log entries</h3>
        {logsQuery.isLoading ? (
          <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Loading activity...</p>
        ) : null}
        <div className="space-y-2">
          {items.map((log) => (
            <div
              key={log._id}
              className={`rounded-xl border p-3 text-sm ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-200 bg-zinc-50'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{log.message}</p>
                  <p className={`mt-1 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                    {formatDateTimeDisplay(log.createdAt)}
                    {log.dateKey ? ` · Transaction date ${formatDateKeyDisplay(log.dateKey)}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${actionBadgeClass(log.action, isDark)}`}>
                    {log.action.replace('.', ' ')}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>
                    {log.entityType}
                  </span>
                </div>
              </div>
              <div className={`mt-2 flex flex-wrap gap-3 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {log.category ? <span>Category: {log.category}</span> : null}
                {log.label ? <span>Label: {log.label}</span> : null}
                {typeof log.amountRupees === 'number' && log.amountRupees > 0 ? (
                  <span className={isDark ? 'text-lime-300' : 'text-lime-700'}>{formatCurrencyFromRupees(log.amountRupees)}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        {!logsQuery.isLoading && items.length === 0 ? (
          <p className={`mt-2 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
            No activity for these filters. New actions will appear here automatically.
          </p>
        ) : null}
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
    </section>
  );
}

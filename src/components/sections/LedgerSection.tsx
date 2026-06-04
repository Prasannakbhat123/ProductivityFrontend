import { addMonths, format, subMonths } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../lib/api';
import { formatCurrencyFromRupees } from '../../lib/format';
import { PaginationControls } from '../common/PaginationControls';

type LedgerSectionProps = {
  monthDate: Date;
  onChangeMonthDate: (date: Date) => void;
  isDark: boolean;
};

export function LedgerSection({ monthDate, onChangeMonthDate, isDark }: LedgerSectionProps) {
  const [reasonFilter, setReasonFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [ledgerPage, setLedgerPage] = useState(1);
  const LEDGER_PAGE_SIZE = 20;
  const monthKey = format(monthDate, 'yyyy-MM');
  const monthInputValue = format(monthDate, 'yyyy-MM');
  const yearInputValue = format(monthDate, 'yyyy');
  const monthLabel = format(monthDate, 'MMMM yyyy');

  const summaryQuery = useQuery({
    queryKey: ['ledger-summary', monthKey],
    queryFn: () => api.getSummary(monthKey, 'auto'),
  });

  const ledgerQuery = useQuery({
    queryKey: ['ledger-entries', monthKey, reasonFilter, categoryFilter, ledgerPage],
    queryFn: () =>
      api.getLedger({
        monthKey,
        scope: 'auto',
        page: ledgerPage,
        limit: LEDGER_PAGE_SIZE,
        reason: reasonFilter || undefined,
        category: categoryFilter || undefined,
      }),
  });

  const categoryPerformanceQuery = useQuery({
    queryKey: ['ledger-category-performance', monthKey],
    queryFn: () => api.getCategoryPerformance({ monthKey, mode: 'cumulative', scope: 'auto' }),
  });

  const summary = summaryQuery.data;
  const ledgerResult = ledgerQuery.data;
  const entries = ledgerResult?.items ?? [];
  const categories = categoryPerformanceQuery.data ?? [];

  const chartPieData = categories
    .filter((item) => item.spentRupees > 0)
    .map((item) => ({ name: item.category, value: item.spentRupees }));
  const pieColors = ['#84cc16', '#22c55e', '#06b6d4', '#f59e0b', '#ef4444', '#a855f7'];

  const balanceTrendData = useMemo(() => {
    return [...entries]
      .reverse()
      .map((entry) => ({
        date: new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
        balance: entry.balanceAfterRupees,
      }));
  }, [entries]);

  const categoryOptions = useMemo(() => categories.map((item) => item.category), [categories]);

  const totalSaved = categories.reduce((sum, item) => sum + item.savedRupees, 0);
  const totalOverspent = categories.reduce((sum, item) => sum + item.overspentRupees, 0);
  const cardBase = isDark
    ? 'rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl'
    : 'rounded-2xl border border-zinc-300 bg-white p-4 shadow-lg';

  return (
    <section className="space-y-4">
      <article className={`${cardBase} p-4 sm:p-5`}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Ledger Dashboard</h2>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Category-level spend intelligence, carry-forward, and balance tracking.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={() => onChangeMonthDate(subMonths(monthDate, 1))}
              className={`rounded-lg border px-2 py-1 text-xs transition ${isDark ? 'border-zinc-700 text-zinc-200 hover:border-lime-300' : 'border-zinc-300 text-zinc-700 hover:border-lime-500'}`}
            >
              Prev
            </button>
            <span className={`min-w-28 text-center text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>{monthLabel}</span>
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
              onChange={(event) => onChangeMonthDate(new Date(`${event.target.value}-01T00:00:00.000Z`))}
              className={`rounded-lg border px-2 py-1 text-xs outline-none ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900'}`}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
            />
            <input
              type="number"
              min="2000"
              max="2100"
              value={yearInputValue}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (Number.isNaN(next)) return;
                const month = format(monthDate, 'MM');
                onChangeMonthDate(new Date(`${next}-${month}-01T00:00:00.000Z`));
              }}
              className={`w-20 rounded-lg border px-2 py-1 text-xs outline-none ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900'}`}
            />
          </div>
        </div>
        {summary?.hasFutureDaysExcluded ? (
          <p className={`mt-2 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
            Current month is shown up to today; future days are excluded from ledger calculations.
          </p>
        ) : null}
      </article>

      <article className={cardBase}>
        <h3 className={`mb-2 text-xs sm:text-sm font-bold uppercase tracking-wide ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Carry Forward Formula</h3>
        <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className={`rounded-xl border p-3 text-xs ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-zinc-300 bg-zinc-100 text-zinc-700'}`}>
            Salary This Month
            <p className={`mt-1 text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{formatCurrencyFromRupees(summary?.totalIncomeRupees ?? 0)}</p>
          </div>
          <div className={`rounded-xl border p-3 text-xs ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-zinc-300 bg-zinc-100 text-zinc-700'}`}>
            Prev Month Carry (Signed)
            <p className={`mt-1 text-base font-bold ${(summary?.carryForwardFromPrevMonthRupees ?? 0) < 0 ? 'text-red-500' : 'text-lime-500'}`}>
              {formatCurrencyFromRupees(summary?.carryForwardFromPrevMonthRupees ?? 0)}
            </p>
          </div>
          <div className={`rounded-xl border p-3 text-xs ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-300' : 'border-zinc-300 bg-zinc-100 text-zinc-700'}`}>
            Effective Available
            <p className={`mt-1 text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{formatCurrencyFromRupees(summary?.effectiveAvailableRupees ?? 0)}</p>
          </div>
        </div>
      </article>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <article className={cardBase}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Income</p>
          <p className={`mt-1 text-2xl font-black ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{formatCurrencyFromRupees(summary?.totalIncomeRupees ?? 0)}</p>
        </article>
        <article className={cardBase}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Spent</p>
          <p className={`mt-1 text-2xl font-black ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{formatCurrencyFromRupees(summary?.totalSpentRupees ?? 0)}</p>
        </article>
        <article className={cardBase}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Carry Forward</p>
          <p className={`mt-1 text-2xl font-black ${(summary?.selectedMonthCarryForwardRupees ?? 0) < 0 ? 'text-red-500' : isDark ? 'text-lime-300' : 'text-lime-600'}`}>
            {formatCurrencyFromRupees(summary?.selectedMonthCarryForwardRupees ?? 0)}
          </p>
        </article>
        <article className={cardBase}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Running Savings Balance</p>
          <p className={`mt-1 text-2xl font-black ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {formatCurrencyFromRupees(entries[0]?.balanceAfterRupees ?? 0)}
          </p>
        </article>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <article className={cardBase}>
          <h3 className={`mb-2 text-sm font-bold uppercase tracking-wide ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Category Spend Split</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartPieData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={86} paddingAngle={2}>
                  {chartPieData.map((item, index) => (
                    <Cell key={item.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#ffffff', border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}` }} formatter={(value) => formatCurrencyFromRupees(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={cardBase}>
          <h3 className={`mb-2 text-sm font-bold uppercase tracking-wide ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Balance Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={balanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3f3f46' : '#d4d4d8'} />
                <XAxis dataKey="date" tick={{ fill: isDark ? '#a1a1aa' : '#52525b', fontSize: 11 }} />
                <YAxis tick={{ fill: isDark ? '#a1a1aa' : '#52525b', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#18181b' : '#ffffff', border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}` }} formatter={(value) => formatCurrencyFromRupees(Number(value))} />
                <Area type="monotone" dataKey="balance" stroke={isDark ? '#84cc16' : '#65a30d'} fill={isDark ? 'rgba(132,204,22,0.35)' : 'rgba(101,163,13,0.25)'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((item) => (
          <article key={item.category} className={cardBase}>
            <div className="mb-2 flex items-start justify-between">
              <h3 className={`text-sm font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{item.category}</h3>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${item.overspentRupees > 0 ? (isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-200 text-red-800') : item.savedRupees > 0 ? (isDark ? 'bg-lime-900/30 text-lime-300' : 'bg-lime-200 text-lime-800') : isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
                {item.status}
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Allocated</span>
                <span className={isDark ? 'text-zinc-200' : 'text-zinc-900'}>{formatCurrencyFromRupees(item.allocatedRupees)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Spent</span>
                <span className={isDark ? 'text-zinc-200' : 'text-zinc-900'}>{formatCurrencyFromRupees(item.spentRupees)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Overspent</span>
                <span className={item.overspentRupees > 0 ? 'text-red-500' : isDark ? 'text-zinc-300' : 'text-zinc-700'}>{formatCurrencyFromRupees(item.overspentRupees)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Saved</span>
                <span className={item.savedRupees > 0 ? 'text-lime-500' : isDark ? 'text-zinc-300' : 'text-zinc-700'}>{formatCurrencyFromRupees(item.savedRupees)}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <article className={cardBase}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Total Saved Across Categories</p>
          <p className="mt-1 text-xl font-black text-lime-500">{formatCurrencyFromRupees(totalSaved)}</p>
        </article>
        <article className={cardBase}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Total Overspent Across Categories</p>
          <p className="mt-1 text-xl font-black text-red-500">{formatCurrencyFromRupees(totalOverspent)}</p>
        </article>
      </div>

      <article className={cardBase}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className={`text-base font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Ledger Entries</h3>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={reasonFilter}
              onChange={(event) => {
                setReasonFilter(event.target.value);
                setLedgerPage(1);
              }}
              className={`rounded-lg border px-2 py-1 text-xs transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-600' : 'border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400'}`}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
            >
              <option value="">All Reasons</option>
              <option value="overspend-adjustment">Overspend</option>
              <option value="month-end-rollover">Rollover</option>
              <option value="manual-correction">Manual Correction</option>
              <option value="goal-allocation">Goal Allocation</option>
              <option value="goal-release">Goal Release</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setLedgerPage(1);
              }}
              className={`rounded-lg border px-2 py-1 text-xs transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-zinc-600' : 'border-zinc-300 bg-white text-zinc-900 hover:border-zinc-400'}`}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
            >
              <option value="">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          {ledgerQuery.isLoading ? <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Loading ledger entries...</p> : null}
          {entries.map((entry) => (
            <div key={entry._id} className={`grid gap-2 rounded-xl border p-3 text-xs md:grid-cols-[1fr_auto_auto] ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'}`}>
              <div>
                <p className={`font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{entry.reason}</p>
                <p className={isDark ? 'text-zinc-500' : 'text-zinc-600'}>{entry.note || '-'}</p>
                <p className={isDark ? 'text-zinc-500' : 'text-zinc-600'}>{new Date(entry.date).toLocaleDateString('en-GB')}</p>
                {entry.metadata?.category ? (
                  <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>
                    {String(entry.metadata.category)}
                  </span>
                ) : null}
              </div>
              <div className={`text-right font-semibold ${entry.deltaRupees < 0 ? 'text-red-500' : 'text-lime-500'}`}>{formatCurrencyFromRupees(entry.deltaRupees)}</div>
              <div className={`text-right ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Bal: {formatCurrencyFromRupees(entry.balanceAfterRupees)}</div>
            </div>
          ))}
          {!ledgerQuery.isLoading && entries.length === 0 ? <p className={`text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>No ledger entries for selected filters.</p> : null}
        </div>
        {ledgerResult ? (
          <div className="mt-4">
            <PaginationControls
              page={ledgerResult.page}
              totalPages={ledgerResult.totalPages}
              total={ledgerResult.total}
              isDark={isDark}
              onPageChange={setLedgerPage}
            />
          </div>
        ) : null}
      </article>
    </section>
  );
}

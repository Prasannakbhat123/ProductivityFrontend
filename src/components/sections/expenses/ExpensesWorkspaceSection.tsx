import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { CalendarEventItem, CategoryPerformanceItem, Expense, HeatmapItem } from '../../../types/finance';
import { api } from '../../../lib/api';
import { formatCurrencyFromRupees } from '../../../lib/format';
import { ExpenseEntrySection } from '../ExpenseEntrySection';
import { CalendarSection } from '../CalendarSection';
import { ExpenseSearchPanel } from './ExpenseSearchPanel';

type ExpensesWorkspaceSectionProps = {
  monthKey: string;
  monthDate: Date;
  onChangeMonthDate: (date: Date) => void;
  isDark: boolean;
  selectedDate: string;
  onSelectDate: (value: string) => void;
  calendarDays: Date[];
  heatmapMap: Map<string, HeatmapItem>;
  maxHeat: number;
  monthExpenses: Expense[];
  dateExpenses: Expense[];
  events: CalendarEventItem[];
  categories: string[];
  isPendingEntry: boolean;
  onCreateCategory: (name: string) => Promise<void> | void;
  onAddExpense: (payload: { amount: string; category: string; title: string; note: string; date: string }) => void;
  onAddIncome: (payload: { amount: string; source: string; note: string; date: string }) => void;
  onCreateEvent: (payload: {
    title: string;
    startsAt: string;
    reminderMinutesBefore: number;
    emailReminderEnabled: boolean;
    emailTo?: string;
  }) => void;
  isSavingEvent: boolean;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
};

export function ExpensesWorkspaceSection(props: ExpensesWorkspaceSectionProps) {
  const {
    monthKey,
    monthDate,
    onChangeMonthDate,
    isDark,
    selectedDate,
    onSelectDate,
    calendarDays,
    heatmapMap,
    maxHeat,
    monthExpenses,
    dateExpenses,
    events,
    categories,
    isPendingEntry,
    onCreateCategory,
    onAddExpense,
    onAddIncome,
    onCreateEvent,
    isSavingEvent,
    onEditExpense,
    onDeleteExpense,
  } = props;

  const [mode, setMode] = useState<'cumulative' | 'date'>('cumulative');

  const categoryPerformanceQuery = useQuery({
    queryKey: ['category-performance', monthKey, selectedDate, mode],
    queryFn: () =>
      api.getCategoryPerformance({
        monthKey,
        mode,
        dateKey: selectedDate,
        scope: 'auto',
      }),
  });

  const categoryCards = useMemo(() => {
    const data = categoryPerformanceQuery.data ?? [];
    if (mode === 'date') {
      return data.filter((item) => item.spentRupees > 0);
    }
    return data;
  }, [categoryPerformanceQuery.data, mode]);

  const cardBase = isDark
    ? 'rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-xl'
    : 'rounded-2xl border border-zinc-300 bg-white p-4 shadow-lg';

  return (
    <section className="space-y-4">
      <div className={`rounded-2xl border p-3 sm:p-4 ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-white'}`}>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <h2 className={`text-base sm:text-lg font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Expenses Workspace</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('cumulative')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${mode === 'cumulative' ? 'bg-lime-300 text-zinc-950' : isDark ? 'border border-zinc-700 text-zinc-200 hover:border-lime-300' : 'border border-zinc-300 text-zinc-700 hover:border-lime-500'}`}
            >
              Till Selected Date
            </button>
            <button
              type="button"
              onClick={() => setMode('date')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${mode === 'date' ? 'bg-lime-300 text-zinc-950' : isDark ? 'border border-zinc-700 text-zinc-200 hover:border-lime-300' : 'border border-zinc-300 text-zinc-700 hover:border-lime-500'}`}
            >
              Date Only
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
          <ExpenseEntrySection
            categories={categories}
            isDark={isDark}
            isPending={isPendingEntry}
            onCreateCategory={onCreateCategory}
            onSubmitExpense={onAddExpense}
            onSubmitIncome={onAddIncome}
          />

          <CalendarSection
            monthDate={monthDate}
            onChangeMonthDate={onChangeMonthDate}
            isDark={isDark}
            selectedDate={selectedDate}
            onSelectDate={(value) => {
              onSelectDate(value);
              setMode('date');
            }}
            calendarDays={calendarDays}
            heatmapMap={heatmapMap}
            maxHeat={maxHeat}
            monthExpenses={monthExpenses}
            dateExpenses={dateExpenses}
            events={events}
            onCreateEvent={onCreateEvent}
            isSavingEvent={isSavingEvent}
            onEditExpense={onEditExpense}
            onDeleteExpense={onDeleteExpense}
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {categoryCards.map((item: CategoryPerformanceItem) => {
            const percentageSpent = item.allocatedRupees > 0 ? Math.min(100, (item.spentRupees / item.allocatedRupees) * 100) : 0;
            const progressBarColor = item.overspentRupees > 0 ? 'bg-red-500' : percentageSpent > 80 ? 'bg-amber-500' : 'bg-lime-500';
            
            return (
              <article key={item.category} className={cardBase}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className={`text-sm font-extrabold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{item.category}</h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{percentageSpent.toFixed(0)}% spent</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${
                      item.overspentRupees > 0
                        ? (isDark ? 'bg-red-900/40 text-red-300' : 'bg-red-200 text-red-800')
                        : item.savedRupees > 0
                          ? (isDark ? 'bg-lime-900/30 text-lime-300' : 'bg-lime-200 text-lime-800')
                          : isDark
                            ? 'bg-zinc-800 text-zinc-300'
                            : 'bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
                    <div className={`h-full ${progressBarColor} transition-all`} style={{ width: `${percentageSpent}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Budget</span>
                    <span className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>{formatCurrencyFromRupees(item.allocatedRupees)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Spent</span>
                    <span className={`text-xs font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-900'}`}>{formatCurrencyFromRupees(item.spentRupees)}</span>
                  </div>

                  {item.overspentRupees > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-red-200 dark:border-red-900/30">
                      <span className={`text-xs font-medium text-red-600 ${isDark ? 'dark:text-red-400' : ''}`}>Overspent</span>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400">{formatCurrencyFromRupees(item.overspentRupees)}</span>
                    </div>
                  )}
                  
                  {item.savedRupees > 0 && (
                    <div className="flex items-center justify-between pt-1 border-t border-lime-200 dark:border-lime-900/30">
                      <span className={`text-xs font-medium text-lime-700 ${isDark ? 'dark:text-lime-400' : ''}`}>Saved</span>
                      <span className="text-xs font-bold text-lime-600 dark:text-lime-400">{formatCurrencyFromRupees(item.savedRupees)}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
      </div>

      <ExpenseSearchPanel
        monthKey={monthKey}
        isDark={isDark}
        categories={categories}
        onEditExpense={onEditExpense}
        onDeleteExpense={onDeleteExpense}
      />
    </section>
  );
}

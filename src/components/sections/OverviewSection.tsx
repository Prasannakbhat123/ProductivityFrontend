import { useEffect, useMemo, useState } from 'react';
import type { CalendarEventItem, Expense, Goal, HeatmapItem, MonthSummary } from '../../types/finance';
import { formatCurrencyFromRupees, formatDateKeyDisplay, formatDateTimeDisplay } from '../../lib/format';
import { OverviewTopSection } from './overview/OverviewTopSection';
import { OverviewBottomCards } from './overview/OverviewBottomCards';

type OverviewSectionProps = {
  monthKey: string;
  monthDate: Date;
  onChangeMonthDate: (date: Date) => void;
  selectedDate: string;
  onSelectDate: (value: string) => void;
  summary: MonthSummary | undefined;
  calendarDays: Date[];
  heatmapMap: Map<string, HeatmapItem>;
  maxHeat: number;
  expenses: Expense[];
  dateExpenses: Expense[];
  events: CalendarEventItem[];
  selectedDateEvents: CalendarEventItem[];
  goals: Goal[];
  isDark: boolean;
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onCompleteGoal: (id: string, isCompleted: boolean) => void;
  onAddGoal: (title: string) => void;
  isAddingGoal?: boolean;
};

export function OverviewSection({
  monthKey,
  monthDate,
  onChangeMonthDate,
  selectedDate,
  onSelectDate,
  summary,
  calendarDays,
  heatmapMap,
  maxHeat,
  expenses,
  dateExpenses,
  events,
  selectedDateEvents,
  goals,
  isDark,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
  onCompleteGoal,
  onAddGoal,
  isAddingGoal,
}: OverviewSectionProps) {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [notes, setNotes] = useState<string[]>(() => {
    const stored = localStorage.getItem('ledgerflow-sticky-notes');
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
    } catch {
      return [];
    }
  });
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    localStorage.setItem('ledgerflow-sticky-notes', JSON.stringify(notes));
  }, [notes]);

  const income = summary?.totalIncomeRupees ?? 0;
  const spent = summary?.totalSpentRupees ?? 0;
  const remaining = income - spent;

  const cardBase = isDark
    ? 'rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl transition-all duration-300'
    : 'rounded-2xl border border-zinc-300 bg-white p-5 shadow-lg transition-all duration-300';

  const weekDates = useMemo(() => {
    const start = new Date(`${selectedDate}T00:00:00.000Z`);
    const monday = new Date(start);
    const day = monday.getUTCDay() || 7;
    monday.setUTCDate(monday.getUTCDate() - day + 1);
    return Array.from({ length: 7 }, (_, index) => {
      const next = new Date(monday);
      next.setUTCDate(monday.getUTCDate() + index);
      return next;
    });
  }, [selectedDate]);

  const weeklyTotal = weekDates.reduce((sum, day) => {
    const key = `${day.getUTCFullYear()}-${String(day.getUTCMonth() + 1).padStart(2, '0')}-${String(day.getUTCDate()).padStart(2, '0')}`;
    const total = expenses
      .filter((expense) => expense.dateKey === key)
      .reduce((expenseSum, expense) => expenseSum + expense.amountRupees, 0);
    return sum + total;
  }, 0);

  const categoryData = Object.entries(
    expenses.reduce<Record<string, number>>((accumulator, expense) => {
      accumulator[expense.category] = (accumulator[expense.category] ?? 0) + expense.amountRupees;
      return accumulator;
    }, {}),
  )
    .map(([category, total]) => ({ category, total }))
    .sort((left, right) => right.total - left.total)
    .slice(0, 6);

  return (
    <section className="space-y-5 sm:space-y-6">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <article className={`rounded-2xl p-4 sm:p-5 shadow-xl transition-all duration-300 ${isDark ? 'border border-zinc-300 bg-white text-zinc-950' : 'border border-zinc-900 bg-zinc-950 text-white'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-600' : 'text-zinc-300'}`}>Income</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">{formatCurrencyFromRupees(income)}</p>
        </article>
        <article className={`rounded-2xl p-4 sm:p-5 shadow-xl transition-all duration-300 ${cardBase}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Spent</p>
          <p className={`mt-2 text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{formatCurrencyFromRupees(spent)}</p>
        </article>
        <article className={`rounded-2xl p-4 sm:p-5 shadow-xl transition-all duration-300 col-span-1 sm:col-span-2 lg:col-span-1 ${cardBase}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Remaining</p>
          <p className={`mt-2 text-2xl sm:text-3xl font-black tracking-tight ${remaining >= 0 ? (isDark ? 'text-zinc-100' : 'text-zinc-900') : 'text-red-500'}`}>
            {formatCurrencyFromRupees(Math.abs(remaining))}
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{remaining >= 0 ? 'Available balance' : 'Overspent'}</p>
        </article>
      </div>

      <OverviewTopSection
        isDark={isDark}
        monthKey={monthKey}
        monthDate={monthDate}
        onChangeMonthDate={onChangeMonthDate}
        onOpenAddExpense={onOpenAddExpense}
        view={view}
        onChangeView={setView}
        calendarDays={calendarDays}
        selectedDate={selectedDate}
        onSelectDate={(dateKey) => {
          onSelectDate(dateKey);
          setIsDayModalOpen(true);
        }}
        heatmapMap={heatmapMap}
        maxHeat={maxHeat}
        events={events}
        weeklyTotal={weeklyTotal}
        weekDates={weekDates}
        expenses={expenses}
        dateExpenses={dateExpenses}
      />

      <OverviewBottomCards
        isDark={isDark}
        goals={goals}
        onToggleGoal={onCompleteGoal}
        onAddGoal={onAddGoal}
        isAddingGoal={isAddingGoal}
        categoryData={categoryData}
        notes={notes}
        onOpenNoteModal={() => setIsNoteModalOpen(true)}
      />

      {isDayModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className={`w-full max-w-2xl rounded-2xl border p-5 shadow-2xl ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-300 bg-white'}`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className={`text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{formatDateKeyDisplay(selectedDate)} Breakdown</h3>
              <button
                type="button"
                onClick={() => setIsDayModalOpen(false)}
                className={`rounded-lg border px-3 py-1 text-xs ${isDark ? 'border-zinc-700 text-zinc-200' : 'border-zinc-300 text-zinc-700'}`}
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div className={`rounded-xl border p-3 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Expenses</p>
                {dateExpenses.length === 0 ? (
                  <p className={`mt-2 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>No expenses on this date.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {dateExpenses.map((expense) => (
                      <div key={expense._id} className="flex items-center justify-between rounded-lg border border-zinc-700/30 px-3 py-2 text-sm">
                        <div>
                          <p className={isDark ? 'text-zinc-100' : 'text-zinc-900'}>{expense.category}</p>
                          <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{expense.note || 'No note'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={isDark ? 'text-zinc-200' : 'text-zinc-900'}>{formatCurrencyFromRupees(expense.amountRupees)}</span>
                          <button
                            type="button"
                            onClick={() => onEditExpense(expense)}
                            className={`rounded-lg border px-2 py-1 text-xs ${isDark ? 'border-zinc-700 text-zinc-200 hover:border-lime-300' : 'border-zinc-300 text-zinc-700 hover:border-lime-500'}`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteExpense(expense._id)}
                            className={`rounded-lg border px-2 py-1 text-xs ${isDark ? 'border-red-800 bg-red-950/40 text-red-300 hover:bg-red-950/70' : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={`rounded-xl border p-3 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Events</p>
                {selectedDateEvents.length === 0 ? (
                  <p className={`mt-2 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>No events on this date.</p>
                ) : (
                  <div className="mt-2 space-y-1">
                    {selectedDateEvents.map((event) => (
                      <div key={event._id} className="flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#d6b4fc]" />
                          <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>{event.title}</span>
                        </span>
                        <span className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>{formatDateTimeDisplay(event.startsAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isNoteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-5 shadow-2xl ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-300 bg-white'}`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className={`text-base font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Add Sticky Note</h3>
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className={`rounded-lg border px-3 py-1 text-xs ${isDark ? 'border-zinc-700 text-zinc-200' : 'border-zinc-300 text-zinc-700'}`}
              >
                Close
              </button>
            </div>
            <textarea
              value={newNote}
              onChange={(event) => setNewNote(event.target.value)}
              rows={5}
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-300' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
              placeholder="Write a few lines..."
            />
            <button
              type="button"
              onClick={() => {
                const trimmed = newNote.trim();
                if (!trimmed) return;
                setNotes((current) => [trimmed, ...current].slice(0, 12));
                setNewNote('');
                setIsNoteModalOpen(false);
              }}
              className="mt-3 rounded-xl bg-lime-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-lime-200"
            >
              Save Note
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

import { addMonths, format, subMonths } from 'date-fns';
import { Plus } from 'lucide-react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CalendarEventItem, Expense, HeatmapItem } from '../../../types/finance';
import { formatCurrencyFromRupees, formatDateKeyDisplay, toDateKey } from '../../../lib/format';

type OverviewTopSectionProps = {
  isDark: boolean;
  monthKey: string;
  monthDate: Date;
  onChangeMonthDate: (date: Date) => void;
  onOpenAddExpense: () => void;
  view: 'daily' | 'weekly' | 'monthly';
  onChangeView: (view: 'daily' | 'weekly' | 'monthly') => void;
  calendarDays: Date[];
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  heatmapMap: Map<string, HeatmapItem>;
  maxHeat: number;
  events: CalendarEventItem[];
  weeklyTotal: number;
  weekDates: Date[];
  expenses: Expense[];
  dateExpenses: Expense[];
};

export function OverviewTopSection(props: OverviewTopSectionProps) {
  const {
    isDark,
    monthKey,
    monthDate,
    onChangeMonthDate,
    onOpenAddExpense,
    view,
    onChangeView,
    calendarDays,
    selectedDate,
    onSelectDate,
    heatmapMap,
    maxHeat,
    events,
    weeklyTotal,
    weekDates,
    expenses,
    dateExpenses,
  } = props;

  const cardBase = isDark
    ? 'rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5 shadow-xl transition-all duration-300'
    : 'rounded-2xl border border-zinc-300 bg-white p-4 sm:p-5 shadow-lg transition-all duration-300';

  const monthInputValue = format(monthDate, 'yyyy-MM');
  const yearInputValue = format(monthDate, 'yyyy');

  const trendData = calendarDays.map((day) => {
    const key = toDateKey(day);
    return {
      date: format(day, 'd'),
      total: heatmapMap.get(key)?.totalRupees ?? 0,
    };
  });

  const dayCellBackground = (totalRupees: number, hasEvent: boolean, isSelected: boolean): string => {
    if (hasEvent) {
      const opacity = maxHeat > 0 ? Math.max(0.25, totalRupees / maxHeat) : 0.25;
      return isSelected ? '#d6b4fc' : `rgba(214, 180, 252, ${opacity})`;
    }
    const opacity = maxHeat > 0 ? Math.max(0.12, totalRupees / maxHeat) : 0.12;
    return isSelected ? '#bef264' : `rgba(132, 204, 22, ${opacity})`;
  };

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
      <article className={`${cardBase} sm:col-span-2 lg:col-span-3`}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h2 className={`text-base sm:text-lg font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Calendar Overview</h2>
            <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Same click behavior as Calendar tab with modal breakdown.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onChangeMonthDate(subMonths(monthDate, 1))}
              className={`rounded-lg border px-2 py-1 text-xs transition ${isDark ? 'border-zinc-700 text-zinc-200 hover:border-lime-300' : 'border-zinc-300 text-zinc-700 hover:border-lime-500'}`}
            >
              Prev
            </button>
            <span className={`min-w-24 text-center text-xs font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>{monthKey}</span>
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
            <button
              type="button"
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-2 rounded-xl bg-lime-300 px-3 py-1.5 text-xs font-semibold text-zinc-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-lime-200"
            >
              <Plus size={12} />
              Add Expense
            </button>
          </div>
        </div>

        <div className={`mb-4 inline-flex rounded-lg border p-1 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'}`}>
          {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChangeView(mode)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition ${
                view === mode
                  ? 'bg-lime-300 text-zinc-950'
                  : isDark
                    ? 'text-zinc-300 hover:bg-zinc-800'
                    : 'text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {view === 'monthly' ? (
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const key = toDateKey(day);
              const item = heatmapMap.get(key);
              const total = item?.totalRupees ?? 0;
              const hasEvent = events.some((event) => toDateKey(new Date(event.startsAt)) === key);
              const isSelected = key === selectedDate;
              return (
                <button
                  type="button"
                  onClick={() => onSelectDate(key)}
                  key={key}
                  className={`relative flex aspect-square items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-200 hover:scale-[1.03] ${
                    isSelected
                      ? hasEvent
                        ? 'border-[#b98be8] text-zinc-950'
                        : 'border-lime-300 text-zinc-950'
                      : isDark
                        ? 'border-zinc-800 text-zinc-200'
                        : 'border-zinc-300 text-zinc-700'
                  }`}
                  style={{ backgroundColor: dayCellBackground(total, hasEvent, isSelected) }}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        ) : null}

        {view === 'weekly' ? (
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-2">
              {weekDates.map((day) => {
                const key = toDateKey(day);
                const total = expenses
                  .filter((expense) => expense.dateKey === key)
                  .reduce((sum, expense) => sum + expense.amountRupees, 0);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectDate(key)}
                    className={`rounded-lg border px-2 py-3 text-xs transition-all duration-200 ${
                      selectedDate === key
                        ? 'border-lime-300 bg-lime-300 text-zinc-950'
                        : isDark
                          ? 'border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500'
                          : 'border-zinc-300 bg-zinc-100 text-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    <p className="font-bold">{format(day, 'EEE')}</p>
                    <p>{format(day, 'd')}</p>
                    <p className="mt-1 opacity-80">{formatCurrencyFromRupees(total)}</p>
                  </button>
                );
              })}
            </div>
            <p className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Weekly Total: {formatCurrencyFromRupees(weeklyTotal)}
            </p>
          </div>
        ) : null}

        {view === 'daily' ? (
          <div className={`rounded-xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'}`}>
            <p className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>
              Selected Date: {formatDateKeyDisplay(selectedDate)}
            </p>
            <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Daily Total: {formatCurrencyFromRupees(dateExpenses.reduce((sum, item) => sum + item.amountRupees, 0))}
            </p>
          </div>
        ) : null}
      </article>

      <article className={`${cardBase} lg:col-span-2`}>
        <h3 className={`mb-2 text-base sm:text-lg font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Spend Trend</h3>
        <p className={`mb-3 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Daily spending direction for this month.</p>
        <div className="h-56 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#3f3f46' : '#d4d4d8'} />
              <XAxis dataKey="date" tick={{ fill: isDark ? '#a1a1aa' : '#52525b', fontSize: 11 }} />
              <YAxis tick={{ fill: isDark ? '#a1a1aa' : '#52525b', fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrencyFromRupees(Number(value))} />
              <Line type="monotone" dataKey="total" stroke="#84cc16" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </article>
    </div>
  );
}

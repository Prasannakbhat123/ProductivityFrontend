import { addMonths, endOfWeek, format, startOfWeek, subMonths } from 'date-fns';
import { useMemo, useState } from 'react';
import type { CalendarEventItem, Expense, HeatmapItem } from '../../types/finance';
import { formatCurrencyFromRupees, formatDateKeyDisplay, formatDateTimeDisplay, toDateKey } from '../../lib/format';
import { getExpenseDisplayLabel, getExpenseSecondaryLine } from '../../lib/expense';

type CalendarSectionProps = {
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

export function CalendarSection(props: CalendarSectionProps) {
  const {
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
    onCreateEvent,
    isSavingEvent,
    onEditExpense,
    onDeleteExpense,
  } = props;

  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDateTime, setEventDateTime] = useState(() => `${selectedDate}T10:00`);
  const [eventEmailEnabled, setEventEmailEnabled] = useState(false);
  const [eventEmail, setEventEmail] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState(120);
  const [eventFormError, setEventFormError] = useState('');

  const weekDates = useMemo(() => {
    const date = new Date(`${selectedDate}T00:00:00.000Z`);
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    const dates: Date[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }, [selectedDate]);

  const weeklyExpenses = useMemo(() => {
    const keys = new Set(weekDates.map((item) => toDateKey(item)));
    return monthExpenses.filter((expense) => keys.has(expense.dateKey));
  }, [weekDates, monthExpenses]);

  const weeklyTotal = weeklyExpenses.reduce((sum, expense) => sum + expense.amountRupees, 0);

  const monthInputValue = format(monthDate, 'yyyy-MM');
  const yearInputValue = format(monthDate, 'yyyy');
  const monthLabel = format(monthDate, 'MMMM yyyy');

  const cardBase = isDark
    ? 'rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl transition-all duration-300'
    : 'rounded-2xl border border-zinc-300 bg-white p-5 shadow-lg transition-all duration-300';

  const selectedDateEvents = events.filter((event) => toDateKey(new Date(event.startsAt)) === selectedDate);

  const handleDateSelect = (dateKey: string) => {
    onSelectDate(dateKey);
    setIsDayModalOpen(true);
  };

  const saveEvent = () => {
    if (!eventTitle.trim() || !eventDateTime) return;
    if (eventEmailEnabled && !eventEmail.trim()) {
      setEventFormError('Email is required when email reminder is enabled.');
      return;
    }
    setEventFormError('');
    onCreateEvent({
      title: eventTitle.trim(),
      startsAt: new Date(eventDateTime).toISOString(),
      reminderMinutesBefore: reminderMinutes || 120,
      emailReminderEnabled: eventEmailEnabled,
      emailTo: eventEmailEnabled ? eventEmail.trim() : undefined,
    });
    setEventTitle('');
    setEventDateTime(`${selectedDate}T10:00`);
    setEventEmailEnabled(false);
    setEventEmail('');
    setReminderMinutes(120);
    setIsEventModalOpen(false);
  };

  return (
    <section className="space-y-4">
      <article className={cardBase}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h2 className={`text-lg sm:text-xl font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Calendar</h2>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Daily, weekly, monthly and direct month/year navigation.</p>
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
              onClick={() => {
                setEventDateTime(`${selectedDate}T10:00`);
                setIsEventModalOpen(true);
                setEventFormError('');
              }}
              className="rounded-xl bg-[#d6b4fc] px-3 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-[#c29be8]"
            >
              Add Event
            </button>
          </div>
        </div>

        <div className={`mb-4 inline-flex rounded-lg border p-1 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'}`}>
          {(['daily', 'weekly', 'monthly'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setView(mode)}
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
              const dayKey = toDateKey(day);
              const item = heatmapMap.get(dayKey);
              const total = item?.totalRupees ?? 0;
              const isActive = selectedDate === dayKey;
              const hasEvent = events.some((event) => toDateKey(new Date(event.startsAt)) === dayKey);
              const opacity = maxHeat > 0 ? Math.max(0.15, total / maxHeat) : 0.15;
              const backgroundColor = hasEvent
                ? isActive
                  ? '#d6b4fc'
                  : `rgba(214, 180, 252, ${Math.max(opacity, 0.28)})`
                : isActive
                  ? '#bef264'
                  : `rgba(132, 204, 22, ${opacity})`;
              return (
                <button
                  key={dayKey}
                  type="button"
                  className={`relative flex aspect-square items-center justify-center rounded-lg border text-xs font-semibold transition-all duration-200 hover:scale-[1.03] ${
                    isActive
                      ? hasEvent
                        ? 'border-[#b98be8] text-zinc-950'
                        : 'border-lime-300 text-zinc-950'
                      : isDark
                        ? 'border-zinc-800 text-zinc-200 hover:border-zinc-600'
                        : 'border-zinc-300 text-zinc-700 hover:border-zinc-500'
                  }`}
                  style={{ backgroundColor }}
                  onClick={() => handleDateSelect(dayKey)}
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
                const total = monthlyTotalForDate(monthExpenses, key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleDateSelect(key)}
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
            <p className={`text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Weekly Total: {formatCurrencyFromRupees(weeklyTotal)}
            </p>
          </div>
        ) : null}

        {view === 'daily' ? (
          <div className={`rounded-xl border p-4 ${isDark ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'}`}>
            <p className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-700'}`}>
              Selected Date: {formatDateKeyDisplay(selectedDate)}
            </p>
            <p className={`mt-1 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Daily Total: {formatCurrencyFromRupees(dateExpenses.reduce((sum, item) => sum + item.amountRupees, 0))}
            </p>
          </div>
        ) : null}
      </article>

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
                          <p className={isDark ? 'text-zinc-100' : 'text-zinc-900'}>{getExpenseDisplayLabel(expense)}</p>
                          <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{getExpenseSecondaryLine(expense)}</p>
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

      {isEventModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className={`w-full max-w-xl rounded-2xl border p-5 shadow-2xl ${isDark ? 'border-zinc-700 bg-zinc-950' : 'border-zinc-300 bg-white'}`}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className={`text-lg font-bold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Create Event</h3>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className={`rounded-lg border px-3 py-1 text-xs ${isDark ? 'border-zinc-700 text-zinc-200' : 'border-zinc-300 text-zinc-700'}`}
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Title</label>
                <input
                  value={eventTitle}
                  onChange={(event) => setEventTitle(event.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-[#d6b4fc]' : 'border-zinc-300 bg-white text-zinc-900 focus:border-[#c29be8]'}`}
                />
              </div>

              <div>
                <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Date Time</label>
                <input
                  type="datetime-local"
                  value={eventDateTime}
                  onChange={(event) => setEventDateTime(event.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-[#d6b4fc]' : 'border-zinc-300 bg-white text-zinc-900 focus:border-[#c29be8]'}`}
                />
              </div>

              <div>
                <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Reminder (minutes before)</label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={reminderMinutes}
                  onChange={(event) => setReminderMinutes(Number(event.target.value) || 120)}
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-[#d6b4fc]' : 'border-zinc-300 bg-white text-zinc-900 focus:border-[#c29be8]'}`}
                />
              </div>

              <label className={`md:col-span-2 inline-flex items-center gap-2 text-sm ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                <input
                  type="checkbox"
                  checked={eventEmailEnabled}
                  onChange={(event) => setEventEmailEnabled(event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-400 text-[#d6b4fc]"
                />
                Send email reminder
              </label>

              {eventEmailEnabled ? (
                <div className="md:col-span-2">
                  <label className={`mb-1 block text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Email</label>
                  <input
                    type="email"
                    value={eventEmail}
                    onChange={(event) => setEventEmail(event.target.value)}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-[#d6b4fc]' : 'border-zinc-300 bg-white text-zinc-900 focus:border-[#c29be8]'}`}
                  />
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={saveEvent}
              disabled={isSavingEvent}
              className="mt-4 rounded-xl bg-[#d6b4fc] px-4 py-2 text-sm font-semibold text-zinc-950 transition-all duration-200 hover:bg-[#c29be8] disabled:opacity-60"
            >
              {isSavingEvent ? 'Saving Event...' : 'Save Event'}
            </button>
            {eventFormError ? <p className="mt-2 text-xs text-red-400">{eventFormError}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function monthlyTotalForDate(expenses: Expense[], dateKey: string): number {
  return expenses
    .filter((expense) => expense.dateKey === dateKey)
    .reduce((sum, expense) => sum + expense.amountRupees, 0);
}

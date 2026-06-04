import { useEffect, useMemo, useState } from 'react';
import { CircleDollarSign } from 'lucide-react';
import { addDays, endOfMonth, format, startOfMonth } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewSection } from './components/sections/OverviewSection';
import { LedgerSection } from './components/sections/LedgerSection';
import { ManageSection } from './components/sections/ManageSection';
import { AnalyticsSection } from './components/sections/AnalyticsSection';
import { NotesSection } from './components/sections/NotesSection';
import { ExpensesWorkspaceSection } from './components/sections/expenses/ExpensesWorkspaceSection';
import { ExpenseEditorModal } from './components/common/ExpenseEditorModal';
import { ConfirmActionModal } from './components/common/ConfirmActionModal';
import { AddExpenseModal } from './components/common/AddExpenseModal';
import type { TransactionEntryType } from './lib/transactionEntry';
import { ToastStack, type ToastItem, type ToastKind } from './components/common/ToastStack';
import { api, createRealtimeEventSource } from './lib/api';
import { getErrorMessage } from './lib/errors';
import { getCurrentMonthKey, parseAmountToRupees, toDateKey } from './lib/format';
import type { TabKey } from './types/ui';
import type { Expense } from './types/finance';

function App() {
  const queryClient = useQueryClient();
  const [viewMonthDate, setViewMonthDate] = useState(() => startOfMonth(new Date()));
  const viewMonthKey = format(viewMonthDate, 'yyyy-MM');

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(new Date()));
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [transactionModalDefaultType, setTransactionModalDefaultType] = useState<TransactionEntryType>('expense');
  const [isDark, setIsDark] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = (kind: ToastKind, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((items) => [...items, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 4500);
  };

  useEffect(() => {
    const stored = localStorage.getItem('ledgerflow-theme');
    const dark = stored ? stored === 'dark' : true;
    setIsDark(dark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('ledgerflow-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const source = createRealtimeEventSource();
    const refresh = () => {
      queryClient.invalidateQueries();
    };

    source.addEventListener('expense.created', refresh);
    source.addEventListener('income.created', refresh);
    source.addEventListener('income.updated', refresh);
    source.addEventListener('income.deleted', refresh);
    source.addEventListener('month.summary.updated', refresh);
    source.addEventListener('analytics.updated', refresh);
    source.addEventListener('rollover.completed', refresh);

    return () => source.close();
  }, [queryClient]);

  const summaryQuery = useQuery({
    queryKey: ['summary', viewMonthKey],
    queryFn: () => api.getSummary(viewMonthKey),
  });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: api.getCategories });
  const goalsQuery = useQuery({ queryKey: ['goals'], queryFn: api.getGoals });
  const analyticsQuery = useQuery({ queryKey: ['analytics-logs'], queryFn: api.getAnalyticsLogs });
  const heatmapQuery = useQuery({ queryKey: ['heatmap', viewMonthKey], queryFn: () => api.getHeatmap(viewMonthKey) });
  const eventsQuery = useQuery({ queryKey: ['events', viewMonthKey], queryFn: () => api.getEvents(viewMonthKey) });
  const addIncomeMutation = useMutation({
    mutationFn: (payload: { amount: string; source: string; note: string; date: string }) =>
      api.addIncome({
        amountRupees: parseAmountToRupees(payload.amount),
        source: payload.source,
        note: payload.note,
        date: new Date(`${payload.date}T12:00:00.000Z`).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setShowAddExpenseModal(false);
      pushToast('success', 'Income recorded.');
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to add income.')),
  });

  const deleteIncomeMutation = useMutation({
    mutationFn: (id: string) => api.deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      pushToast('success', 'Income removed.');
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to delete income.')),
  });

  const addExpenseMutation = useMutation({
    mutationFn: (payload: { amount: string; category: string; note: string; date: string }) =>
      api.addExpense({
        amountRupees: parseAmountToRupees(payload.amount),
        category: payload.category,
        note: payload.note,
        date: new Date(`${payload.date}T12:00:00.000Z`).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      pushToast('success', 'Expense saved.');
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to add expense.')),
  });

  const updateExpenseMutation = useMutation({
    mutationFn: (payload: { id: string; amountRupees: number; category: string; note?: string }) =>
      api.updateExpense(payload.id, {
        amountRupees: payload.amountRupees,
        category: payload.category,
        note: payload.note,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries();
      setEditingExpense(null);
      pushToast('success', 'Expense updated.');
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to update expense.')),
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: (id: string) => api.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries();
      pushToast('success', 'Expense deleted.');
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to delete expense.')),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => api.addCategory({ name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const rolloverMutation = useMutation({
    mutationFn: () => api.rollover(viewMonthKey),
    onSuccess: () => queryClient.invalidateQueries(),
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to run rollover.')),
  });

  const addGoalMutation = useMutation({
    mutationFn: (title: string) => api.addGoal({ title, targetRupees: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      pushToast('success', 'Goal added.');
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to add goal.')),
  });

  const completeGoalMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: string; isCompleted: boolean }) => api.setGoalStatus(id, isCompleted),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to update goal.')),
  });

  const addEventMutation = useMutation({
    mutationFn: (payload: {
      title: string;
      startsAt: string;
      reminderMinutesBefore: number;
      emailReminderEnabled: boolean;
      emailTo?: string;
    }) =>
      api.addEvent({
        title: payload.title,
        startsAt: payload.startsAt,
        reminderMinutesBefore: payload.reminderMinutesBefore,
        emailReminderEnabled: payload.emailReminderEnabled,
        emailTo: payload.emailTo,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const analyticsData = (analyticsQuery.data ?? []).map((item) => ({
    period: item.periodKey,
    total: item.payload.totalRupees,
    txns: item.payload.transactions,
  }));

  const heatmapMap = new Map((heatmapQuery.data ?? []).map((item) => [item._id, item]));
  const monthStart = startOfMonth(new Date(`${viewMonthKey}-01T00:00:00.000Z`));
  const monthEnd = endOfMonth(monthStart);
  const calendarDays: Date[] = [];
  let cursor = monthStart;
  while (cursor <= monthEnd) {
    calendarDays.push(cursor);
    cursor = addDays(cursor, 1);
  }
  const maxHeat = Math.max(1, ...(heatmapQuery.data ?? []).map((item) => item.totalRupees));

  const monthExpenses = summaryQuery.data?.expenses ?? [];
  const monthIncomes = summaryQuery.data?.incomes ?? [];

  const selectedDateExpenses = useMemo(
    () => monthExpenses.filter((expense) => expense.dateKey === selectedDate),
    [monthExpenses, selectedDate],
  );

  const selectedDateIncomes = useMemo(
    () => monthIncomes.filter((income) => income.dateKey === selectedDate),
    [monthIncomes, selectedDate],
  );

  const selectedDateEvents = useMemo(
    () =>
      (eventsQuery.data ?? []).filter(
        (event) => toDateKey(new Date(event.startsAt)) === selectedDate,
      ),
    [eventsQuery.data, selectedDate],
  );

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>([
      ...(categoriesQuery.data ?? []).map((item) => item.name),
      ...((summaryQuery.data?.budgets ?? []).map((b) => b.category)),
      ...(monthExpenses.map((expense) => expense.category)),
      'Food',
      'Transport',
      'Utilities',
      'Shopping',
      'Health',
      'Leisure',
    ]);
    return Array.from(categories).sort();
  }, [categoriesQuery.data, summaryQuery.data?.budgets, monthExpenses]);

  useEffect(() => {
    const isCurrentMonth = viewMonthKey === getCurrentMonthKey();
    if (isCurrentMonth) {
      setSelectedDate(toDateKey(new Date()));
      return;
    }
    setSelectedDate(`${viewMonthKey}-01`);
  }, [viewMonthKey]);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-zinc-100 text-zinc-900'}`}>
      <div className="flex flex-col lg:grid lg:min-h-screen lg:grid-cols-[260px_1fr]">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isDark={isDark}
          onToggleTheme={() => setIsDark((state) => !state)}
        />

        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-5 sm:py-6 md:px-6 md:py-7 lg:p-8">
          <header className="mb-6 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 pl-12 lg:pl-0">
              <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl">Personal Finance Tracker</h1>
              <p className={`${isDark ? 'text-zinc-400' : 'text-zinc-600'} text-xs sm:text-sm`}>Month {viewMonthKey}</p>
            </div>
            <button
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                isDark
                  ? 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-lime-300'
                  : 'border-zinc-300 bg-white text-zinc-900 hover:border-lime-500'
              }`}
              type="button"
              onClick={() => rolloverMutation.mutate()}
            >
              <CircleDollarSign size={16} />
              Run Month-End Rollover
            </button>
          </header>

          {activeTab === 'overview' ? (
            <OverviewSection
              monthKey={viewMonthKey}
              monthDate={viewMonthDate}
              onChangeMonthDate={setViewMonthDate}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              summary={summaryQuery.data}
              calendarDays={calendarDays}
              heatmapMap={heatmapMap}
              maxHeat={maxHeat}
              expenses={monthExpenses}
              dateExpenses={selectedDateExpenses}
              events={eventsQuery.data ?? []}
              selectedDateEvents={selectedDateEvents}
              goals={goalsQuery.data ?? []}
              isDark={isDark}
              onOpenAddExpense={() => {
                setTransactionModalDefaultType('expense');
                setShowAddExpenseModal(true);
              }}
              onOpenAddIncome={() => {
                setTransactionModalDefaultType('income');
                setShowAddExpenseModal(true);
              }}
              dateIncomes={selectedDateIncomes}
              onDeleteIncome={(id) => deleteIncomeMutation.mutate(id)}
              onEditExpense={setEditingExpense}
              onDeleteExpense={(id) => setDeletingExpenseId(id)}
              onCompleteGoal={(id, isCompleted) => completeGoalMutation.mutate({ id, isCompleted })}
              onAddGoal={(title) => addGoalMutation.mutate(title)}
              isAddingGoal={addGoalMutation.isPending}
            />
          ) : null}

          {activeTab === 'expenses' ? (
            <ExpensesWorkspaceSection
              monthKey={viewMonthKey}
              monthDate={viewMonthDate}
              onChangeMonthDate={setViewMonthDate}
              isDark={isDark}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              calendarDays={calendarDays}
              heatmapMap={heatmapMap}
              maxHeat={maxHeat}
              monthExpenses={monthExpenses}
              dateExpenses={selectedDateExpenses}
              events={eventsQuery.data ?? []}
              categories={uniqueCategories}
              isPendingEntry={addExpenseMutation.isPending || addIncomeMutation.isPending}
              onCreateCategory={async (name) => {
                await createCategoryMutation.mutateAsync(name);
              }}
              onAddExpense={(payload) => addExpenseMutation.mutate(payload)}
              onAddIncome={(payload) => addIncomeMutation.mutate(payload)}
              onCreateEvent={(payload) => addEventMutation.mutate(payload)}
              isSavingEvent={addEventMutation.isPending}
              onEditExpense={setEditingExpense}
              onDeleteExpense={(id) => setDeletingExpenseId(id)}
            />
          ) : null}

          {activeTab === 'ledger' ? <LedgerSection monthDate={viewMonthDate} onChangeMonthDate={setViewMonthDate} isDark={isDark} /> : null}

          {activeTab === 'manage' ? <ManageSection monthKey={viewMonthKey} isDark={isDark} /> : null}

          {activeTab === 'analytics' ? <AnalyticsSection points={analyticsData} expenses={monthExpenses} isDark={isDark} /> : null}

          {activeTab === 'notes' ? <NotesSection isDark={isDark} /> : null}

          <AddExpenseModal
            isOpen={showAddExpenseModal}
            isDark={isDark}
            categories={uniqueCategories}
            isPending={addExpenseMutation.isPending || addIncomeMutation.isPending}
            defaultEntryType={transactionModalDefaultType}
            defaultDate={selectedDate}
            onClose={() => setShowAddExpenseModal(false)}
            onCreateCategory={async (name) => {
              await createCategoryMutation.mutateAsync(name);
            }}
            onSubmitExpense={(payload) => {
              addExpenseMutation.mutate(payload, {
                onSuccess: () => setShowAddExpenseModal(false),
              });
            }}
            onSubmitIncome={(payload) => addIncomeMutation.mutate(payload)}
          />

          {editingExpense ? (
            <ExpenseEditorModal
              expense={editingExpense}
              isSubmitting={updateExpenseMutation.isPending}
              onClose={() => setEditingExpense(null)}
              onSubmit={(payload) => {
                updateExpenseMutation.mutate({
                  id: payload.id,
                  amountRupees: parseAmountToRupees(String(payload.amountRupees)),
                  category: payload.category,
                  note: payload.note,
                });
              }}
            />
          ) : null}

          {deletingExpenseId ? (
            <ConfirmActionModal
              title="Delete Expense"
              description="This will remove the expense and recalculate budget/savings adjustments for the month."
              confirmLabel="Delete"
              isPending={deleteExpenseMutation.isPending}
              onClose={() => setDeletingExpenseId(null)}
              onConfirm={() => {
                deleteExpenseMutation.mutate(deletingExpenseId, {
                  onSettled: () => setDeletingExpenseId(null),
                });
              }}
            />
          ) : null}
        </main>
      </div>
      <ToastStack toasts={toasts} isDark={isDark} />
    </div>
  );
}

export default App;

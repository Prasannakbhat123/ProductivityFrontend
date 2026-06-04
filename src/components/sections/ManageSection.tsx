import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, subMonths } from 'date-fns';
import { api } from '../../lib/api';
import { formatCurrencyFromRupees, parseAmountToRupees } from '../../lib/format';
import { CustomDropdown } from '../common/CustomDropdown';
import type { CategoryPerformanceItem } from '../../types/finance';

type ManageSectionProps = {
  monthKey: string;
  isDark: boolean;
};

type ManagePane = 'incomeBudget' | 'categories' | 'recurring';
type ToastKind = 'success' | 'error' | 'info' | 'warning';

type ToastItem = {
  id: number;
  kind: ToastKind;
  message: string;
};

export function ManageSection({ monthKey, isDark }: ManageSectionProps) {
  const queryClient = useQueryClient();
  const [pane, setPane] = useState<ManagePane>('incomeBudget');

  const [incomeInput, setIncomeInput] = useState('0');
  const [budgetCategory, setBudgetCategory] = useState('Food');
  const [budgetLimit, setBudgetLimit] = useState('0');
  const [budgetsViewMonthKey, setBudgetsViewMonthKey] = useState(monthKey);

  const [newCategory, setNewCategory] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  const [recurringTitle, setRecurringTitle] = useState('');
  const [recurringAmount, setRecurringAmount] = useState('0');
  const [recurringCategory, setRecurringCategory] = useState('Food');
  const [recurringMode, setRecurringMode] = useState<'reminder' | 'auto-add'>('reminder');
  const [editingRecurringId, setEditingRecurringId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const previousMonthKey = useMemo(() => {
    const baseDate = new Date(`${monthKey}-01T00:00:00.000Z`);
    return format(subMonths(baseDate, 1), 'yyyy-MM');
  }, [monthKey]);

  const budgetsViewPreviousMonthKey = useMemo(() => {
    const baseDate = new Date(`${budgetsViewMonthKey}-01T00:00:00.000Z`);
    return format(subMonths(baseDate, 1), 'yyyy-MM');
  }, [budgetsViewMonthKey]);

  const summaryQuery = useQuery({ queryKey: ['summary', monthKey], queryFn: () => api.getSummary(monthKey) });
  const previousSummaryQuery = useQuery({
    queryKey: ['summary', previousMonthKey],
    queryFn: () => api.getSummary(previousMonthKey),
  });
  const budgetsViewSummaryQuery = useQuery({
    queryKey: ['summary', budgetsViewMonthKey],
    queryFn: () => api.getSummary(budgetsViewMonthKey),
  });
  const budgetsViewPreviousSummaryQuery = useQuery({
    queryKey: ['summary', budgetsViewPreviousMonthKey],
    queryFn: () => api.getSummary(budgetsViewPreviousMonthKey),
  });
  const budgetsViewCategoryPerformanceQuery = useQuery({
    queryKey: ['manage-category-performance', budgetsViewMonthKey],
    queryFn: () => api.getCategoryPerformance({ monthKey: budgetsViewMonthKey, mode: 'cumulative', scope: 'auto' }),
  });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: api.getCategories });
  const recurringQuery = useQuery({ queryKey: ['recurring'], queryFn: api.getRecurring });

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

  const pushToast = (kind: ToastKind, message: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((items) => [...items, { id, kind, message }]);
    setTimeout(() => {
      setToasts((items) => items.filter((item) => item.id !== id));
    }, 3200);
  };

  const categoryNames = useMemo(
    () => (categoriesQuery.data ?? []).map((item) => item.name).sort((left, right) => left.localeCompare(right)),
    [categoriesQuery.data],
  );

  const categoryOptions = useMemo(
    () => categoryNames.map((name) => ({ label: name, value: name })),
    [categoryNames],
  );

  const viewMonthBudgetByCategory = useMemo(
    () => new Map((budgetsViewSummaryQuery.data?.budgets ?? []).map((budget) => [budget.category, budget])),
    [budgetsViewSummaryQuery.data?.budgets],
  );

  const viewMonthPreviousBudgetByCategory = useMemo(
    () => new Map((budgetsViewPreviousSummaryQuery.data?.budgets ?? []).map((budget) => [budget.category, budget])),
    [budgetsViewPreviousSummaryQuery.data?.budgets],
  );

  const viewMonthPerformanceByCategory = useMemo(
    () => new Map((budgetsViewCategoryPerformanceQuery.data ?? []).map((item: CategoryPerformanceItem) => [item.category, item])),
    [budgetsViewCategoryPerformanceQuery.data],
  );

  const setIncomeMutation = useMutation({
    mutationFn: () => api.setIncome({ monthKey, amountRupees: parseAmountToRupees(incomeInput) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      pushToast('success', `Income saved for ${monthKey}.`);
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to save income.')),
  });

  const setBudgetMutation = useMutation({
    mutationFn: () => api.setBudget({ monthKey, category: budgetCategory, limitRupees: parseAmountToRupees(budgetLimit) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['manage-category-performance', monthKey] });
      pushToast('success', `Budget saved for ${budgetCategory} in ${monthKey}.`);
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to save budget.')),
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id: string) => api.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['manage-category-performance', monthKey] });
      pushToast('info', `Budget removed for ${monthKey}; previous month default applies.`);
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to delete budget.')),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => api.addCategory({ name }),
    onSuccess: () => {
      setNewCategory('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      pushToast('success', 'Category created successfully.');
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to create category.')),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.updateCategory(id, { name }),
    onSuccess: () => {
      setEditingCategoryId(null);
      setEditingCategoryName('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      pushToast('success', 'Category updated.');
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to update category.')),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => api.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      pushToast('info', 'Category deleted.');
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to delete category.')),
  });

  const createRecurringMutation = useMutation({
    mutationFn: () =>
      api.addRecurring({
        title: recurringTitle,
        amountRupees: parseAmountToRupees(recurringAmount),
        category: recurringCategory,
        frequency: 'monthly',
        mode: recurringMode,
        startDate: new Date().toISOString(),
        dayOfMonth: 1,
      }),
    onSuccess: () => {
      setRecurringTitle('');
      setRecurringAmount('0');
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      pushToast('success', 'Recurring rule created.');
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to create recurring rule.')),
  });

  const toggleRecurringMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api.toggleRecurring(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      pushToast('info', 'Recurring rule status updated.');
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to toggle recurring rule.')),
  });

  const updateRecurringMutation = useMutation({
    mutationFn: (id: string) =>
      api.updateRecurring(id, {
        title: recurringTitle,
        amountRupees: parseAmountToRupees(recurringAmount),
        category: recurringCategory,
        mode: recurringMode,
      }),
    onSuccess: () => {
      setEditingRecurringId(null);
      setRecurringTitle('');
      setRecurringAmount('0');
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      pushToast('success', 'Recurring rule updated.');
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to update recurring rule.')),
  });

  const deleteRecurringMutation = useMutation({
    mutationFn: (id: string) => api.deleteRecurring(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      pushToast('info', 'Recurring rule deleted.');
    },
    onError: (error) => pushToast('error', getErrorMessage(error, 'Failed to delete recurring rule.')),
  });

  const tabs: Array<{ key: ManagePane; label: string }> = [
    { key: 'incomeBudget', label: 'Income & Budgets' },
    { key: 'categories', label: 'Categories' },
    { key: 'recurring', label: 'Recurring' },
  ];

  const shellCard = isDark
    ? 'rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl transition-all duration-300'
    : 'rounded-2xl border border-zinc-300 bg-white p-5 shadow-lg transition-all duration-300';

  useEffect(() => {
    if (summaryQuery.data) {
      setIncomeInput(String(summaryQuery.data.totalIncomeRupees));
    }
  }, [summaryQuery.data]);

  useEffect(() => {
    const currentMonthBudget = (summaryQuery.data?.budgets ?? []).find((budget) => budget.category === budgetCategory);
    const previousMonthBudget = (previousSummaryQuery.data?.budgets ?? []).find((budget) => budget.category === budgetCategory);
    const defaultLimitRupees = currentMonthBudget?.limitRupees ?? previousMonthBudget?.limitRupees ?? 0;
    setBudgetLimit(String(defaultLimitRupees));
  }, [budgetCategory, monthKey, summaryQuery.data?.budgets, previousSummaryQuery.data?.budgets]);

  useEffect(() => {
    if (categoryNames.length === 0) return;
    if (!categoryNames.includes(budgetCategory)) {
      setBudgetCategory(categoryNames[0]);
    }
    if (!categoryNames.includes(recurringCategory)) {
      setRecurringCategory(categoryNames[0]);
    }
  }, [categoryNames, budgetCategory, recurringCategory]);

  useEffect(() => {
    setBudgetsViewMonthKey(monthKey);
  }, [monthKey]);

  return (
    <section className="space-y-4">
      <div className={`flex w-full flex-wrap gap-1 rounded-xl border p-1 sm:inline-flex ${isDark ? 'border-zinc-800 bg-zinc-950' : 'border-zinc-300 bg-zinc-100'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setPane(tab.key)}
            className={`cursor-pointer flex-1 rounded-lg px-2 py-1.5 text-xs sm:flex-none sm:px-3 sm:text-sm font-medium transition ${
              pane === tab.key
                ? 'bg-lime-300 text-zinc-950'
                : isDark
                  ? 'text-zinc-300 hover:bg-zinc-900'
                  : 'text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {pane === 'incomeBudget' ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
          <article className={shellCard}>
            <h3 className={`text-base sm:text-lg font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Monthly Salary</h3>
            <p className={`mt-1 text-xs sm:text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Set or update your monthly income.</p>
            <p className={`mt-2 text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
              Current income: {formatCurrencyFromRupees(summaryQuery.data?.totalIncomeRupees ?? 0)}
            </p>
            <input
              type="number"
              min="0"
              step="1"
              value={incomeInput}
              onChange={(event) => setIncomeInput(event.target.value)}
              className={`mt-4 w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-400' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
            />
            <button
              type="button"
              onClick={() => setIncomeMutation.mutate()}
              disabled={setIncomeMutation.isPending}
              className="mt-3 cursor-pointer rounded-xl bg-lime-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-lime-200 disabled:opacity-60"
            >
              {setIncomeMutation.isPending ? 'Saving...' : 'Save Income'}
            </button>
          </article>

          <article className={shellCard}>
            <h3 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Category Budget</h3>
            <p className={`mt-1 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Add or edit budget by saving for same category.</p>
            <div className="mt-4 grid gap-3">
              <CustomDropdown
                value={budgetCategory}
                options={categoryOptions}
                onChange={setBudgetCategory}
                isDark={isDark}
                onCreateOption={async (name) => {
                  await createCategoryMutation.mutateAsync(name);
                }}
                searchPlaceholder="Search or add category"
              />
              <input
                type="number"
                min="0"
                step="1"
                value={budgetLimit}
                onChange={(event) => setBudgetLimit(event.target.value)}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-400' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
              />
              <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                Default is picked from {previousMonthKey} for this category. Saving updates only {monthKey}.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!budgetCategory.trim()) {
                    pushToast('warning', 'Please select a category first.');
                    return;
                  }
                  if (parseAmountToRupees(budgetLimit) < 0) {
                    pushToast('warning', 'Budget cannot be negative.');
                    return;
                  }
                  setBudgetMutation.mutate();
                }}
                disabled={setBudgetMutation.isPending}
                className="cursor-pointer rounded-xl bg-lime-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-lime-200 disabled:opacity-60"
              >
                {setBudgetMutation.isPending ? 'Saving...' : 'Save Budget'}
              </button>
            </div>
          </article>

          <article className={`${shellCard} lg:col-span-2`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Current Budgets</h3>
                <p className={`mt-0.5 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                  Showing categories from one master list. Inherited defaults are clearly tagged.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>View month</span>
                <input
                  type="month"
                  value={budgetsViewMonthKey}
                  onChange={(event) => setBudgetsViewMonthKey(event.target.value)}
                  className={`rounded-lg border px-2 py-1 text-xs outline-none ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900'}`}
                  style={{ colorScheme: isDark ? 'dark' : 'light' }}
                />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {categoryNames.length === 0 ? (
                <div className={`rounded-xl border px-3 py-4 text-sm ${isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-400' : 'border-zinc-300 bg-zinc-100 text-zinc-600'}`}>
                  No categories yet. Add a category first in the Categories tab.
                </div>
              ) : null}
              {categoryNames.map((categoryName) => {
                const currentBudget = viewMonthBudgetByCategory.get(categoryName);
                const previousBudget = viewMonthPreviousBudgetByCategory.get(categoryName);
                const effectiveLimitRupees = currentBudget?.limitRupees ?? previousBudget?.limitRupees ?? 0;
                const spentRupees = viewMonthPerformanceByCategory.get(categoryName)?.spentRupees ?? 0;
                const isInherited = !currentBudget && Boolean(previousBudget);

                return (
                <div key={categoryName} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'}`}>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`text-sm font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{categoryName}</p>
                      {isInherited ? (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isDark ? 'bg-amber-900/40 text-amber-300' : 'bg-amber-100 text-amber-700'}`}>
                          Inherited from previous month
                        </span>
                      ) : null}
                    </div>
                    <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                      Limit: {formatCurrencyFromRupees(effectiveLimitRupees)} | Spent: {formatCurrencyFromRupees(spentRupees)}
                    </p>
                  </div>
                  {currentBudget ? (
                    <button
                      type="button"
                      onClick={() => deleteBudgetMutation.mutate(currentBudget._id)}
                      className={`cursor-pointer rounded-lg border px-2 py-1 text-xs transition ${isDark ? 'border-red-900 bg-red-950/40 text-red-300 hover:bg-red-950/70' : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'}`}
                    >
                      Delete
                    </button>
                  ) : (
                    <span className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                      Not set this month
                    </span>
                  )}
                </div>
              );})}
            </div>
          </article>
        </div>
      ) : null}

      {pane === 'categories' ? (
        <article className={shellCard}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Categories</h3>
            <span className={`rounded-full px-2 py-1 text-xs font-semibold ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-200 text-zinc-700'}`}>
              Total: {categoryNames.length}
            </span>
          </div>
          <p className={`mt-1 text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
            This is the single category source used across budget, recurring, and expenses.
          </p>
          <div className="mt-4 flex gap-2">
            <input
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              placeholder="New category"
              className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-400' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
            />
            <button
              type="button"
              onClick={() => newCategory.trim() && createCategoryMutation.mutate(newCategory.trim())}
              className="cursor-pointer rounded-xl bg-lime-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-lime-200"
            >
              Add
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {(categoriesQuery.data ?? []).length === 0 ? (
              <div className={`rounded-xl border px-3 py-4 text-sm ${isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-400' : 'border-zinc-300 bg-zinc-100 text-zinc-600'}`}>
                No categories available. Create one to start budgeting.
              </div>
            ) : null}
            {(categoriesQuery.data ?? []).map((category) => (
              <div key={category._id} className={`flex items-center justify-between rounded-xl border px-3 py-2 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'}`}>
                {editingCategoryId === category._id ? (
                  <div className="flex w-full items-center gap-2">
                    <input
                      value={editingCategoryName}
                      onChange={(event) => setEditingCategoryName(event.target.value)}
                      className={`w-full rounded-xl border px-3 py-1.5 text-sm outline-none ${isDark ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-zinc-300 bg-white text-zinc-900'}`}
                    />
                    <button
                      type="button"
                      onClick={() => updateCategoryMutation.mutate({ id: category._id, name: editingCategoryName })}
                      className="cursor-pointer rounded-lg bg-lime-300 px-2 py-1 text-xs font-semibold text-zinc-950"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(null);
                        setEditingCategoryName('');
                      }}
                      className={`rounded-lg border px-2 py-1 text-xs ${isDark ? 'border-zinc-700 text-zinc-200' : 'border-zinc-300 text-zinc-700'}`}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <p className={`text-sm font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{category.name}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryId(category._id);
                          setEditingCategoryName(category.name);
                        }}
                        className={`rounded-lg border px-2 py-1 text-xs ${isDark ? 'border-zinc-700 text-zinc-200' : 'border-zinc-300 text-zinc-700'}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategoryMutation.mutate(category._id)}
                        className={`rounded-lg border px-2 py-1 text-xs ${isDark ? 'border-red-900 bg-red-950/40 text-red-300 hover:bg-red-950/70' : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'}`}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </article>
      ) : null}

      {pane === 'recurring' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <article className={shellCard}>
            <h3 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Add Recurring Expense</h3>
            <div className="mt-4 grid gap-3">
              <input
                value={recurringTitle}
                onChange={(event) => setRecurringTitle(event.target.value)}
                placeholder="Title"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-400' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
              />
              <input
                type="number"
                min="0"
                step="1"
                value={recurringAmount}
                onChange={(event) => setRecurringAmount(event.target.value)}
                placeholder="Amount"
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-400' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
              />
              <CustomDropdown
                value={recurringCategory}
                options={categoryOptions}
                onChange={setRecurringCategory}
                isDark={isDark}
                onCreateOption={async (name) => {
                  await createCategoryMutation.mutateAsync(name);
                }}
              />
              <select
                value={recurringMode}
                onChange={(event) => setRecurringMode(event.target.value as 'reminder' | 'auto-add')}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition ${isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-400' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'}`}
              >
                <option value="reminder">Reminder</option>
                <option value="auto-add">Auto Add</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  if (editingRecurringId) {
                    updateRecurringMutation.mutate(editingRecurringId);
                    return;
                  }
                  createRecurringMutation.mutate();
                }}
                className="cursor-pointer rounded-xl bg-lime-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-lime-200"
              >
                {editingRecurringId ? 'Update Recurring' : 'Save Recurring'}
              </button>
            </div>
          </article>

          <article className={shellCard}>
            <h3 className={`text-lg font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Recurring Rules</h3>
            <div className="mt-3 space-y-2">
              {(recurringQuery.data ?? []).map((rule) => (
                <div key={rule._id} className={`rounded-xl border px-3 py-2 ${isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'}`}>
                  <p className={`text-sm font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{rule.title}</p>
                  <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>{rule.category} • {rule.amountRupees} • {rule.mode}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRecurringId(rule._id);
                        setRecurringTitle(rule.title);
                        setRecurringAmount(String(rule.amountRupees));
                        setRecurringCategory(rule.category);
                        setRecurringMode(rule.mode);
                      }}
                      className={`rounded-lg border px-2 py-1 text-xs ${isDark ? 'border-zinc-700 text-zinc-200' : 'border-zinc-300 text-zinc-700'}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleRecurringMutation.mutate({ id: rule._id, isActive: !rule.isActive })}
                      className={`rounded-lg border px-2 py-1 text-xs ${isDark ? 'border-zinc-700 text-zinc-200' : 'border-zinc-300 text-zinc-700'}`}
                    >
                      {rule.isActive ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRecurringMutation.mutate(rule._id)}
                      className={`rounded-lg border px-2 py-1 text-xs ${isDark ? 'border-red-900 bg-red-950/40 text-red-300 hover:bg-red-950/70' : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      ) : null}

      <div className="fixed right-4 bottom-4 z-[90] space-y-2">
        {toasts.map((toast) => {
          const toneClass =
            toast.kind === 'success'
              ? isDark
                ? 'border-lime-700 bg-lime-950/40 text-lime-200'
                : 'border-lime-300 bg-lime-50 text-lime-800'
              : toast.kind === 'error'
                ? isDark
                  ? 'border-red-700 bg-red-950/40 text-red-200'
                  : 'border-red-300 bg-red-50 text-red-800'
                : toast.kind === 'warning'
                  ? isDark
                    ? 'border-amber-700 bg-amber-950/40 text-amber-200'
                    : 'border-amber-300 bg-amber-50 text-amber-800'
                  : isDark
                    ? 'border-zinc-700 bg-zinc-900 text-zinc-100'
                    : 'border-zinc-300 bg-white text-zinc-800';

          return (
            <div key={toast.id} className={`min-w-72 max-w-sm rounded-xl border px-3 py-2 text-sm shadow-xl ${toneClass}`}>
              {toast.message}
            </div>
          );
        })}
      </div>
    </section>
  );
}

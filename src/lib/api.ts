import type { ActivityLogItem } from '../types/activity';
import type { PaginatedResult } from '../types/api';
import type {
  AnalyticsLog,
  BudgetCategory,
  CalendarEventItem,
  Category,
  CategoryPerformanceItem,
  CategorySpending,
  Expense,
  IncomeEntry,
  Goal,
  HeatmapItem,
  LedgerEntry,
  MonthSummary,
  Notebook,
  RecurringRule,
} from '../types/finance';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed (${response.status})`);
  }

  return (await response.json()) as T;
}

export const api = {
  getSummary: (monthKey: string, scope: 'full' | 'todate' | 'auto' = 'full') =>
    request<MonthSummary>(`/api/finance/summary/${monthKey}?scope=${encodeURIComponent(scope)}`),
  setIncome: (payload: { monthKey: string; amountRupees: number; note?: string }) =>
    request('/api/finance/income', { method: 'POST', body: JSON.stringify(payload) }),
  addIncome: (payload: { amountRupees: number; source: string; note?: string; date?: string }) =>
    request<IncomeEntry>('/api/finance/incomes', { method: 'POST', body: JSON.stringify(payload) }),
  getIncomes: (params: { dateKey?: string; monthKey?: string; limit?: number; page?: number }) => {
    const search = new URLSearchParams();
    if (params.dateKey) search.set('dateKey', params.dateKey);
    if (params.monthKey) search.set('monthKey', params.monthKey);
    if (typeof params.limit === 'number') search.set('limit', String(params.limit));
    if (typeof params.page === 'number') search.set('page', String(params.page));
    return request<PaginatedResult<IncomeEntry>>(`/api/finance/incomes?${search.toString()}`);
  },
  deleteIncome: (id: string) => request<{ ok: true }>(`/api/finance/incomes/${id}`, { method: 'DELETE' }),
  setBudget: (payload: { monthKey: string; category: string; limitRupees: number }) =>
    request<BudgetCategory>('/api/finance/budgets', { method: 'POST', body: JSON.stringify(payload) }),
  deleteBudget: (id: string) => request<{ message: string }>(`/api/finance/budgets/${id}`, { method: 'DELETE' }),
  addExpense: (payload: { amountRupees: number; category: string; title?: string; note?: string; date?: string }) =>
    request<Expense>('/api/finance/expenses', { method: 'POST', body: JSON.stringify(payload) }),
  updateExpense: (
    id: string,
    payload: { amountRupees?: number; category?: string; title?: string; note?: string; date?: string },
  ) => request<Expense>(`/api/finance/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteExpense: (id: string) => request<{ ok: true }>(`/api/finance/expenses/${id}`, { method: 'DELETE' }),
  getExpenses: (params: {
    dateKey?: string;
    monthKey?: string;
    category?: string;
    note?: string;
    minAmount?: number;
    maxAmount?: number;
    limit?: number;
    page?: number;
  }) => {
    const search = new URLSearchParams();
    if (params.dateKey) search.set('dateKey', params.dateKey);
    if (params.monthKey) search.set('monthKey', params.monthKey);
    if (params.category) search.set('category', params.category);
    if (params.note) search.set('note', params.note);
    if (typeof params.minAmount === 'number' && !Number.isNaN(params.minAmount)) search.set('minAmount', String(params.minAmount));
    if (typeof params.maxAmount === 'number' && !Number.isNaN(params.maxAmount)) search.set('maxAmount', String(params.maxAmount));
    if (typeof params.limit === 'number') search.set('limit', String(params.limit));
    if (typeof params.page === 'number') search.set('page', String(params.page));
    return request<PaginatedResult<Expense>>(`/api/finance/expenses?${search.toString()}`);
  },
  getLedger: (params?: {
    monthKey?: string;
    scope?: 'full' | 'todate' | 'auto';
    limit?: number;
    page?: number;
    reason?: string;
    category?: string;
  }) => {
    const search = new URLSearchParams();
    if (params?.monthKey) search.set('monthKey', params.monthKey);
    if (params?.scope) search.set('scope', params.scope);
    if (typeof params?.limit === 'number') search.set('limit', String(params.limit));
    if (typeof params?.page === 'number') search.set('page', String(params.page));
    if (params?.reason) search.set('reason', params.reason);
    if (params?.category) search.set('category', params.category);
    return request<PaginatedResult<LedgerEntry>>(`/api/finance/ledger?${search.toString()}`);
  },
  rollover: (monthKey: string) =>
    request('/api/finance/rollover', { method: 'POST', body: JSON.stringify({ monthKey }) }),
  getGoals: () => request<Goal[]>('/api/finance/goals'),
  addGoal: (payload: { title: string; targetRupees?: number; dueDate?: string }) =>
    request<Goal>('/api/finance/goals', { method: 'POST', body: JSON.stringify(payload) }),
  completeGoal: (id: string) => request<Goal>(`/api/finance/goals/${id}/complete`, { method: 'POST' }),
  setGoalStatus: (id: string, isCompleted: boolean) =>
    request<Goal>(`/api/finance/goals/${id}/status`, { method: 'PATCH', body: JSON.stringify({ isCompleted }) }),
  getRecurring: () => request<RecurringRule[]>('/api/finance/recurring'),
  addRecurring: (payload: {
    title: string;
    amountRupees: number;
    category: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    mode: 'reminder' | 'auto-add';
    startDate: string;
    dayOfMonth?: number;
    dayOfWeek?: number;
  }) => request<RecurringRule>('/api/finance/recurring', { method: 'POST', body: JSON.stringify(payload) }),
  updateRecurring: (
    id: string,
    payload: {
      title?: string;
      amountRupees?: number;
      category?: string;
      frequency?: 'daily' | 'weekly' | 'monthly';
      mode?: 'reminder' | 'auto-add';
      startDate?: string;
      dayOfMonth?: number | null;
      dayOfWeek?: number | null;
    },
  ) => request<RecurringRule>(`/api/finance/recurring/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteRecurring: (id: string) => request<{ message: string }>(`/api/finance/recurring/${id}`, { method: 'DELETE' }),
  toggleRecurring: (id: string, isActive: boolean) =>
    request<RecurringRule>(`/api/finance/recurring/${id}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
  getAnalyticsLogs: () => request<AnalyticsLog[]>('/api/finance/analytics/logs'),
  getHeatmap: (monthKey: string) =>
    request<HeatmapItem[]>(`/api/calendar/heatmap?monthKey=${encodeURIComponent(monthKey)}`),
  getEvents: (monthKey: string) =>
    request<CalendarEventItem[]>(`/api/calendar/events?monthKey=${encodeURIComponent(monthKey)}`),
  addEvent: (payload: {
    title: string;
    description?: string;
    startsAt: string;
    reminderMinutesBefore?: number;
    emailReminderEnabled?: boolean;
    emailTo?: string;
  }) => request<CalendarEventItem>('/api/calendar/events', { method: 'POST', body: JSON.stringify(payload) }),
  // Category endpoints
  getCategories: () => request<Category[]>('/api/finance/categories'),
  addCategory: (payload: { name: string; color?: string; icon?: string; description?: string }) =>
    request<Category>('/api/finance/categories', { method: 'POST', body: JSON.stringify(payload) }),
  getCategory: (id: string) => request<Category>(`/api/finance/categories/${id}`),
  updateCategory: (id: string, payload: { name?: string; color?: string; icon?: string; description?: string }) =>
    request<Category>(`/api/finance/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteCategory: (id: string) => request<{ message: string }>(`/api/finance/categories/${id}`, { method: 'DELETE' }),
  getCategorySpending: (categoryName: string, monthKey: string) =>
    request<CategorySpending>(`/api/finance/categories/${categoryName}/spending/${monthKey}`),
  getCategoryPerformance: (params: {
    monthKey: string;
    mode?: 'cumulative' | 'date';
    dateKey?: string;
    scope?: 'full' | 'todate' | 'auto';
  }) => {
    const search = new URLSearchParams();
    search.set('monthKey', params.monthKey);
    search.set('mode', params.mode ?? 'cumulative');
    search.set('scope', params.scope ?? 'auto');
    if (params.dateKey) search.set('dateKey', params.dateKey);
    return request<CategoryPerformanceItem[]>(`/api/finance/category-performance?${search.toString()}`);
  },
  getActivityLogs: (params: {
    monthKey?: string;
    dateKey?: string;
    category?: string;
    entityType?: string;
    action?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const search = new URLSearchParams();
    if (params.monthKey) search.set('monthKey', params.monthKey);
    if (params.dateKey) search.set('dateKey', params.dateKey);
    if (params.category) search.set('category', params.category);
    if (params.entityType) search.set('entityType', params.entityType);
    if (params.action) search.set('action', params.action);
    if (params.search) search.set('search', params.search);
    if (typeof params.page === 'number') search.set('page', String(params.page));
    if (typeof params.limit === 'number') search.set('limit', String(params.limit));
    return request<PaginatedResult<ActivityLogItem>>(`/api/activity/logs?${search.toString()}`);
  },
  getNotebooks: () => request<Notebook[]>('/api/notes/notebooks'),
  addNotebook: (payload: { title: string; imageUrl?: string; contentHtml?: string }) =>
    request<Notebook>('/api/notes/notebooks', { method: 'POST', body: JSON.stringify(payload) }),
  updateNotebook: (id: string, payload: { title?: string; imageUrl?: string; contentHtml?: string }) =>
    request<Notebook>(`/api/notes/notebooks/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteNotebook: (id: string) => request<{ message: string }>(`/api/notes/notebooks/${id}`, { method: 'DELETE' }),
};

export function createRealtimeEventSource(): EventSource {
  return new EventSource(`${BASE_URL}/api/realtime/stream`);
}


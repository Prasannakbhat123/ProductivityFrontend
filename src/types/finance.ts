export type BudgetCategory = {
  _id: string;
  monthKey: string;
  category: string;
  limitRupees: number;
  spentRupees: number;
};

export type Expense = {
  _id: string;
  date: string;
  dateKey: string;
  monthKey: string;
  amountRupees: number;
  category: string;
  note: string;
  source: 'manual' | 'recurring-auto' | 'recurring-manual';
};

export type Goal = {
  _id: string;
  title: string;
  targetRupees: number;
  currentRupees: number;
  isCompleted: boolean;
  completedAt: string | null;
  dueDate: string | null;
};

export type LedgerEntry = {
  _id: string;
  date: string;
  monthKey: string;
  reason: string;
  deltaRupees: number;
  balanceAfterRupees: number;
  referenceType?: string;
  referenceId?: string;
  note: string;
  metadata?: Record<string, unknown>;
};

export type RecurringRule = {
  _id: string;
  title: string;
  amountRupees: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  mode: 'reminder' | 'auto-add';
  startDate: string;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  isActive: boolean;
};

export type AnalyticsLog = {
  _id: string;
  logType: 'daily' | 'weekly' | 'monthly';
  periodKey: string;
  payload: {
    totalRupees: number;
    transactions: number;
  };
};

export type CalendarEventItem = {
  _id: string;
  title: string;
  description: string;
  startsAt: string;
  reminderMinutesBefore: number | null;
  emailReminderEnabled: boolean;
  emailTo: string;
};

export type HeatmapItem = {
  _id: string;
  totalRupees: number;
  transactions: number;
};

export type MonthSummary = {
  monthKey: string;
  scope?: 'full' | 'todate' | 'auto';
  totalIncomeRupees: number;
  totalBudgetRupees: number;
  totalSpentRupees: number;
  projectedCarryForwardRupees: number;
  selectedMonthCarryForwardRupees: number;
  carryForwardFromPrevMonthRupees: number;
  effectiveAvailableRupees: number;
  totalOverspendAdjustmentsRupees: number;
  budgets: BudgetCategory[];
  expenses: Expense[];
  hasFutureDaysExcluded?: boolean;
};

export type Category = {
  _id: string;
  name: string;
  color: string;
  icon: string;
  description: string;
};

export type CategorySpending = {
  category: string;
  monthKey: string;
  totalRupees: number;
  count: number;
};

export type Notebook = {
  _id: string;
  title: string;
  imageUrl: string;
  contentHtml: string;
  createdAt: string;
  updatedAt: string;
};

export type CategoryPerformanceItem = {
  category: string;
  allocatedRupees: number;
  spentRupees: number;
  overspentRupees: number;
  savedRupees: number;
  status: 'overspent' | 'saved' | 'on-track';
};


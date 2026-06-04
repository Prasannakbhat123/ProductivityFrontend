export type ActivityLogItem = {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  monthKey: string;
  dateKey: string;
  category: string;
  label: string;
  amountRupees?: number;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export const ACTIVITY_ENTITY_TYPES = [
  { value: '', label: 'All types' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'One-time income' },
  { value: 'salary', label: 'Monthly salary' },
  { value: 'budget', label: 'Budget' },
  { value: 'goal', label: 'Goal' },
  { value: 'category', label: 'Category' },
  { value: 'recurring', label: 'Recurring' },
  { value: 'system', label: 'System' },
] as const;

export type TransactionEntryType = 'expense' | 'income';

export const TRANSACTION_TYPE_OPTIONS: { label: string; value: TransactionEntryType }[] = [
  { label: 'Expense (money out)', value: 'expense' },
  { label: 'Income (money in)', value: 'income' },
];

export const DEFAULT_INCOME_SOURCES = ['Paycheck', 'Freelance', 'Business', 'Investment', 'Gift', 'Refund', 'Other'];

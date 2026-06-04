import type { IncomeEntry } from '../types/finance';

export const MONTHLY_SALARY_SOURCE = 'Salary';

export function isMonthlySalaryIncome(income: { source: string }): boolean {
  return income.source.trim().toLowerCase() === MONTHLY_SALARY_SOURCE.toLowerCase();
}

export function getMonthlySalaryDateKey(monthKey: string): string {
  return `${monthKey}-01`;
}

export function splitMonthIncomes(incomes: IncomeEntry[], monthKey: string) {
  const salaryDateKey = getMonthlySalaryDateKey(monthKey);
  const monthlySalaryEntry =
    incomes.find((income) => isMonthlySalaryIncome(income) && income.dateKey === salaryDateKey) ??
    incomes.find((income) => isMonthlySalaryIncome(income)) ??
    null;

  const oneTimeIncomes = incomes.filter((income) => !isMonthlySalaryIncome(income));

  return { monthlySalaryEntry, oneTimeIncomes, salaryDateKey };
}

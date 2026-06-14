export function getExpenseDisplayLabel(expense: { title?: string; category: string }): string {
  const title = expense.title?.trim();
  return title || expense.category;
}

export function getExpenseSecondaryLine(expense: { title?: string; category: string; note?: string }): string {
  if (expense.title?.trim()) {
    const parts = [expense.category];
    if (expense.note?.trim()) parts.push(expense.note.trim());
    return parts.join(' · ');
  }
  return expense.note?.trim() || 'No note';
}

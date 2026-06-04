import { BookOpenText, Flame, LayoutDashboard, ReceiptText, ScrollText, Settings2, TrendingDown } from 'lucide-react';

export type TabKey = 'overview' | 'expenses' | 'ledger' | 'logs' | 'manage' | 'analytics' | 'notes';

export const tabs: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'expenses', label: 'Expenses', icon: TrendingDown },
  { key: 'ledger', label: 'Ledger', icon: ReceiptText },
  { key: 'logs', label: 'Logs', icon: ScrollText },
  { key: 'manage', label: 'Manage', icon: Settings2 },
  { key: 'analytics', label: 'Analytics', icon: Flame },
  { key: 'notes', label: 'Notes', icon: BookOpenText },
];

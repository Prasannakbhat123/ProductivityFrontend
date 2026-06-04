import { Flame } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Expense } from '../../types/finance';
import { formatCurrencyFromRupees } from '../../lib/format';

type AnalyticsPoint = {
  period: string;
  total: number;
  txns: number;
};

type AnalyticsSectionProps = {
  points: AnalyticsPoint[];
  expenses: Expense[];
  isDark: boolean;
};

export function AnalyticsSection({ points, expenses, isDark }: AnalyticsSectionProps) {
  const total = points.reduce((sum, item) => sum + item.total, 0);
  const average = points.length ? Math.round(total / points.length) : 0;
  const totalTransactions = points.reduce((sum, item) => sum + item.txns, 0);

  const categoryBreakdown = Object.entries(
    expenses.reduce<Record<string, number>>((accumulator, expense) => {
      accumulator[expense.category] = (accumulator[expense.category] ?? 0) + expense.amountRupees;
      return accumulator;
    }, {}),
  )
    .map(([category, totalRupees]) => ({ category, totalRupees }))
    .sort((left, right) => right.totalRupees - left.totalRupees)
    .slice(0, 6);

  const trendData = points.slice(0, 16).reverse();
  const pieColors = ['#84cc16', '#22c55e', '#06b6d4', '#f59e0b', '#ef4444', '#a855f7'];
  const cardBase = isDark
    ? 'rounded-2xl border border-zinc-800 bg-zinc-950 p-5 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-700'
    : 'rounded-2xl border border-zinc-300 bg-white p-5 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-400';

  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <article className={cardBase}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Total Spend (Logs)</p>
          <p className={`mt-1 text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{formatCurrencyFromRupees(total)}</p>
        </article>
        <article className={cardBase}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Average / Period</p>
          <p className={`mt-1 text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{formatCurrencyFromRupees(average)}</p>
        </article>
        <article className={cardBase}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Total Transactions</p>
          <p className={`mt-1 text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>{totalTransactions}</p>
        </article>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-3">
        <article className={`${cardBase} lg:col-span-2`}>
          <h3 className={`mb-4 flex items-center gap-2 text-base sm:text-lg font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
            <Flame size={16} className="text-lime-300" />
            Spend Trend (Direction)
          </h3>
          <p className={`mb-3 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Line chart shows spending direction across recent periods.</p>
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: isDark ? '#a1a1aa' : '#52525b' }} />
                <YAxis tick={{ fontSize: 10, fill: isDark ? '#a1a1aa' : '#52525b' }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#84cc16" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={cardBase}>
          <h3 className={`mb-4 text-base sm:text-lg font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Category Split</h3>
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="totalRupees" nameKey="category" innerRadius={42} outerRadius={74} paddingAngle={2}>
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={entry.category} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrencyFromRupees(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-3">
        <article className={`${cardBase} lg:col-span-2`}>
          <h3 className={`mb-4 text-base sm:text-lg font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Transaction Counts</h3>
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={points.slice(0, 10).reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: isDark ? '#a1a1aa' : '#52525b' }} />
                <YAxis tick={{ fontSize: 10, fill: isDark ? '#a1a1aa' : '#52525b' }} />
                <Tooltip />
                <Bar dataKey="txns" fill="#84cc16" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className={cardBase}>
          <h3 className={`mb-4 text-base sm:text-lg font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Spend Area (Volume)</h3>
          <p className={`mb-3 text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Area chart emphasizes magnitude of spend, not just direction.</p>
          <div className="h-56 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points.slice(0, 20).reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: isDark ? '#a1a1aa' : '#52525b' }} />
                <YAxis tick={{ fontSize: 10, fill: isDark ? '#a1a1aa' : '#52525b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#84cc16" fill="rgba(132,204,22,0.35)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  );
}

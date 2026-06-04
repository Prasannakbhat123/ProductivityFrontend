import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { Goal } from '../../../types/finance';
import { formatCurrencyFromRupees } from '../../../lib/format';

type OverviewBottomCardsProps = {
  isDark: boolean;
  goals: Goal[];
  onToggleGoal: (id: string, isCompleted: boolean) => void;
  onAddGoal: (title: string) => void;
  isAddingGoal?: boolean;
  categoryData: Array<{ category: string; total: number }>;
  notes: string[];
  onOpenNoteModal: () => void;
};

const pieColors = ['#84cc16', '#22c55e', '#06b6d4', '#f59e0b', '#ef4444', '#a855f7'];

export function OverviewBottomCards({
  isDark,
  goals,
  onToggleGoal,
  onAddGoal,
  isAddingGoal = false,
  categoryData,
  notes,
  onOpenNoteModal,
}: OverviewBottomCardsProps) {
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const cardBase = isDark
    ? 'rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5 shadow-xl transition-all duration-300'
    : 'rounded-2xl border border-zinc-300 bg-white p-4 sm:p-5 shadow-lg transition-all duration-300';

  const activeGoals = goals.filter((g) => !g.isCompleted);
  const completedGoals = goals.filter((g) => g.isCompleted);

  const handleAddGoal = () => {
    const title = newGoalTitle.trim();
    if (!title) return;
    onAddGoal(title);
    setNewGoalTitle('');
  };

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <article className={`${cardBase} group relative`}>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-zinc-400/40 bg-zinc-900/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100">
          Goals
        </span>
        <h3 className={`mb-3 text-sm sm:text-base font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Goals Checklist</h3>

        <form
          className="mb-3 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            handleAddGoal();
          }}
        >
          <input
            value={newGoalTitle}
            onChange={(event) => setNewGoalTitle(event.target.value)}
            placeholder="Add a goal..."
            className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none ${
              isDark ? 'border-zinc-700 bg-zinc-900 text-zinc-100 focus:border-lime-300' : 'border-zinc-300 bg-white text-zinc-900 focus:border-lime-500'
            }`}
          />
          <button
            type="submit"
            disabled={isAddingGoal || !newGoalTitle.trim()}
            className="shrink-0 rounded-xl bg-lime-300 px-3 py-2 text-sm font-bold text-zinc-950 transition hover:bg-lime-200 disabled:opacity-50"
          >
            Add
          </button>
        </form>

        {goals.length === 0 ? (
          <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>Add your first goal above.</p>
        ) : (
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {[...activeGoals, ...completedGoals].map((goal) => (
              <label
                key={goal._id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2 text-xs sm:text-sm ${
                  isDark ? 'border-zinc-800 bg-zinc-900' : 'border-zinc-300 bg-zinc-100'
                }`}
              >
                <span className="relative mt-0.5 inline-flex shrink-0 items-center">
                  <input
                    type="checkbox"
                    checked={goal.isCompleted}
                    onChange={(event) => onToggleGoal(goal._id, event.target.checked)}
                    className="peer sr-only"
                  />
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-md border transition ${
                      goal.isCompleted ? 'border-lime-300 bg-lime-300 text-zinc-950' : isDark ? 'border-zinc-600 bg-zinc-950' : 'border-zinc-400 bg-white'
                    }`}
                  >
                    {goal.isCompleted ? '✓' : ''}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`block font-medium ${goal.isCompleted ? 'line-through opacity-60' : ''} ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
                  >
                    {goal.title}
                  </span>
                  {goal.targetRupees > 0 ? (
                    <span className={`text-[11px] ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                      Target {formatCurrencyFromRupees(goal.targetRupees)}
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        )}
      </article>

      <article className={`${cardBase} group relative`}>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-zinc-400/40 bg-zinc-900/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100">
          Categories
        </span>
        <h3 className={`mb-3 text-sm sm:text-base font-extrabold tracking-tight ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>Category Spending</h3>
        {categoryData.length > 0 ? (
          <div className="h-40 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="total" nameKey="category" innerRadius={40} outerRadius={82} paddingAngle={2}>
                  {categoryData.map((item, index) => (
                    <Cell key={item.category} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrencyFromRupees(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className={`text-xs sm:text-sm ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>No category data yet.</p>
        )}
      </article>

      <article className={`${cardBase} group relative`}>
        <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-zinc-400/40 bg-zinc-900/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100">
          Sticky Notes
        </span>

        <div className="relative mt-3 min-h-64 rounded-sm bg-[#c7b6d0] p-4 shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
          <div className="absolute -top-3 left-1/2 h-5 w-36 -translate-x-1/2 -rotate-2 bg-[#ea7184] shadow-sm" />
          <div className="absolute bottom-0 right-0 h-10 w-10 bg-[#b9a9c2]" style={{ clipPath: 'polygon(100% 0, 0 100%, 100% 100%)' }} />

          <div className="relative z-10">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-zinc-900">Sticky Note</h3>
              <button
                type="button"
                onClick={onOpenNoteModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-lime-300 text-lg font-bold text-zinc-950 transition hover:bg-lime-200"
              >
                +
              </button>
            </div>
            {notes.length === 0 ? (
              <p className="text-xs sm:text-sm text-zinc-800">Click + to add your first sticky note.</p>
            ) : (
              <div className="space-y-2">
                {notes.slice(0, 4).map((note, index) => (
                  <div key={`${note}-${index}`} className="rounded-lg border border-zinc-700/30 bg-white/70 p-2 text-xs sm:text-sm text-zinc-900">
                    {note}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

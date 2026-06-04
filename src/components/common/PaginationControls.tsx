type PaginationControlsProps = {
  page: number;
  totalPages: number;
  total: number;
  isDark: boolean;
  onPageChange: (page: number) => void;
};

export function PaginationControls({ page, totalPages, total, isDark, onPageChange }: PaginationControlsProps) {
  if (totalPages <= 1 && total === 0) return null;

  const buttonClass = isDark
    ? 'rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-lime-300 disabled:cursor-not-allowed disabled:opacity-40'
    : 'rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition hover:border-lime-500 disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className={`text-xs ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
        Page {page} of {totalPages} · {total} total
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className={buttonClass} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>
        <button type="button" className={buttonClass} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

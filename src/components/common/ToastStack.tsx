export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export type ToastItem = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastStackProps = {
  toasts: ToastItem[];
  isDark: boolean;
};

export function ToastStack({ toasts, isDark }: ToastStackProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex flex-col gap-2">
      {toasts.map((toast) => {
        const toneClass =
          toast.kind === 'success'
            ? isDark
              ? 'border-lime-400/40 bg-lime-950 text-lime-200'
              : 'border-lime-500 bg-lime-50 text-lime-900'
            : toast.kind === 'error'
              ? isDark
                ? 'border-red-500/40 bg-red-950 text-red-200'
                : 'border-red-400 bg-red-50 text-red-900'
              : toast.kind === 'warning'
                ? isDark
                  ? 'border-amber-500/40 bg-amber-950 text-amber-200'
                  : 'border-amber-400 bg-amber-50 text-amber-900'
                : isDark
                  ? 'border-zinc-700 bg-zinc-900 text-zinc-200'
                  : 'border-zinc-300 bg-white text-zinc-900';

        return (
          <div key={toast.id} className={`pointer-events-auto min-w-72 max-w-sm rounded-xl border px-3 py-2 text-sm shadow-xl ${toneClass}`}>
            {toast.message}
          </div>
        );
      })}
    </div>
  );
}

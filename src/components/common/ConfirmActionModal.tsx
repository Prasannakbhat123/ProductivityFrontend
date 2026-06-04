type ConfirmActionModalProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmActionModal({
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isPending = false,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 sm:p-6" role="presentation" onClick={onClose}>
      <div
        className="w-full max-w-sm sm:max-w-lg rounded-2xl border border-zinc-300 bg-white p-4 sm:p-6 text-zinc-900 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
        <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{description}</p>

        <div className="mt-5 sm:mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-xl border border-zinc-300 bg-zinc-100 px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-500"
            onClick={onClose}
            disabled={isPending}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-xl border border-red-900 bg-red-950/50 px-4 py-2 text-xs sm:text-sm font-semibold text-red-300 transition hover:bg-red-950/70"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

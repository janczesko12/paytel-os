import { AlertCircle, X } from "lucide-react";

export function ErrorDialog({
  open,
  title,
  message,
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-border/60 bg-card/90 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-red-500/15 text-red-500">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Zamknij"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-foreground py-3 text-sm font-semibold text-background"
        >
          Rozumiem
        </button>
      </div>
    </div>
  );
}
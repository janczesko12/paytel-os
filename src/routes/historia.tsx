import { createFileRoute } from "@tanstack/react-router";
import { Trash2, CheckCircle2, XCircle } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useHistory } from "@/lib/store";

export const Route = createFileRoute("/historia")({
  head: () => ({
    meta: [
      { title: "Historia skanów – PAYTEL OS" },
      { name: "description", content: "Historia wszystkich zeskanowanych kodów EAN." },
    ],
  }),
  component: HistoryPage,
});

function currency(n: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(n);
}

function HistoryPage() {
  const { entries, clear } = useHistory();

  return (
    <AppShell>
      <header className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Historia</h1>
            <p className="text-sm text-muted-foreground">Wszystkie zeskanowane kody</p>
          </div>
          {entries.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Wyczyścić całą historię?")) clear();
              }}
              className="grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-card/70 text-muted-foreground hover:text-red-500"
              aria-label="Wyczyść historię"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 pt-5">
        {entries.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/70 bg-card/40 p-10 text-center">
            <p className="text-sm text-muted-foreground">Brak wpisów. Zeskanuj pierwszy kod.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {entries.map((e) => {
              const d = new Date(e.timestamp);
              const date = d.toLocaleDateString("pl-PL");
              const time = d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3 backdrop-blur"
                >
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full ${
                      e.success
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-red-500/15 text-red-500"
                    }`}
                  >
                    {e.success ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {e.success ? e.name : e.message ?? "Nieznany produkt"}
                    </p>
                    <p className="truncate font-mono text-xs text-muted-foreground">{e.barcode}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {date} · {time}
                    </p>
                  </div>
                  {e.success && e.price != null && (
                    <span className="text-sm font-semibold tabular-nums text-emerald-500">
                      {currency(e.price)}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
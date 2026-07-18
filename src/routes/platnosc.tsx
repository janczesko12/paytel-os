import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useCart } from "@/lib/store";

export const Route = createFileRoute("/platnosc")({
  head: () => ({
    meta: [
      { title: "Płatność – PAYTEL OS" },
      { name: "description", content: "Podsumowanie i finalizacja płatności." },
    ],
  }),
  component: CheckoutPage,
});

function currency(n: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(n);
}

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [paid, setPaid] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<{ items: typeof cart.items; total: number; at: number } | null>(null);

  const pay = async () => {
    if (cart.items.length === 0 || processing) return;
    setProcessing(true);
    setReceipt({ items: cart.items, total: cart.total, at: Date.now() });
    await new Promise((r) => setTimeout(r, 900));
    cart.clear();
    setPaid(true);
    setProcessing(false);
  };

  if (paid && receipt) {
    const d = new Date(receipt.at);
    return (
      <AppShell>
        <main className="mx-auto flex min-h-[80dvh] max-w-md flex-col items-center justify-center px-5 text-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
            <CheckCircle2 className="h-14 w-14" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">Zapłacono</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {d.toLocaleDateString("pl-PL")} · {d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="mt-6 text-5xl font-black tracking-tight text-emerald-500 tabular-nums">
            {currency(receipt.total)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {receipt.items.length} {receipt.items.length === 1 ? "pozycja" : "pozycji"}
          </p>
          <button
            onClick={() => navigate({ to: "/" })}
            className="mt-10 w-full rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 py-4 font-semibold text-white shadow-lg shadow-emerald-500/30"
          >
            Nowa transakcja
          </button>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <header className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate({ to: "/" })}
            className="grid h-10 w-10 place-items-center rounded-full border border-border/60 bg-card/70"
            aria-label="Wróć"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Płatność</h1>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 pt-5">
        {cart.items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/70 bg-card/40 p-10 text-center">
            <p className="text-sm text-muted-foreground">Koszyk jest pusty.</p>
          </div>
        ) : (
          <>
            <section className="rounded-3xl border border-border/60 bg-card/70 p-5 backdrop-blur-xl">
              <h2 className="text-sm font-semibold text-muted-foreground">Podsumowanie</h2>
              <ul className="mt-3 divide-y divide-border/60">
                {cart.items.map((i) => (
                  <li key={i.barcode} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {i.quantity} × {currency(i.price)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {currency(i.price * i.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-baseline justify-between border-t border-border/60 pt-4">
                <span className="text-base font-semibold">Razem</span>
                <span className="text-3xl font-black tracking-tight text-emerald-500 tabular-nums">
                  {currency(cart.total)}
                </span>
              </div>
            </section>

            <button
              onClick={pay}
              disabled={processing}
              className="mt-6 w-full rounded-3xl bg-gradient-to-b from-emerald-500 to-emerald-600 py-5 text-xl font-bold text-white shadow-xl shadow-emerald-500/30 transition active:scale-[0.99] disabled:opacity-70"
            >
              {processing ? "Przetwarzanie…" : `ZAPŁAĆ · ${currency(cart.total)}`}
            </button>
          </>
        )}
      </main>
    </AppShell>
  );
}
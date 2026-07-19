import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Minus, Plus, ScanLine, Trash2, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { ErrorDialog } from "@/components/ErrorDialog";
import { useCart, useHistory } from "@/lib/store";
import { scanBarcode, ScanError } from "@/lib/api";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Home,
});

function currency(n: number) {
  return new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(n);
}

function Home() {
  const cart = useCart();
  const history = useHistory();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<{ name: string; price: number } | null>(null);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
const [online, setOnline] = useState(true);

useEffect(() => {
  // Odczytuj navigator tylko po hydracji
  if (typeof navigator !== "undefined" && "onLine" in navigator) {
    setOnline(navigator.onLine);
  }

  const handleOnline = () => setOnline(true);
  const handleOffline = () => setOnline(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}, []);
  const handleDetected = async (barcode: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await scanBarcode(barcode);
      if (res.success) {
        cart.addProduct({ barcode: res.barcode, name: res.name, price: res.price });
        history.push({ barcode: res.barcode, name: res.name, price: res.price, success: true });
        setLast({ name: res.name, price: res.price });
        toast.success(res.name, { description: currency(res.price) });
      } else {
        history.push({ barcode, name: null, price: null, success: false, message: res.message });
        toast.error("Nie znaleziono", { description: res.message });
      }
    } catch (err) {
      const message = err instanceof ScanError ? err.message : "Nieznany błąd.";
      const title =
        err instanceof ScanError && err.code === "offline"
          ? "Brak internetu"
          : err instanceof ScanError && err.code === "timeout"
            ? "Przekroczono czas oczekiwania"
            : err instanceof ScanError && err.code === "invalid"
              ? "Nieprawidłowa odpowiedź"
              : "Serwer niedostępny";
      history.push({ barcode, name: null, price: null, success: false, message });
      setError({ title, message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <header className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30">
              <span className="text-lg font-black">P</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">PAYTEL OS</h1>
              <p className="text-xs text-muted-foreground">Mobilny terminal POS</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
              online
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
            }`}
          >
            {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {online ? "Online" : "Offline"}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 pt-5">
        <button
          onClick={() => setScannerOpen(true)}
          className="group relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-left text-white shadow-xl shadow-emerald-500/25 transition active:scale-[0.99]"
        >
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur-md">
              <Camera className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm text-white/80">Skaner</p>
              <p className="text-xl font-semibold">Zeskanuj produkt</p>
            </div>
            <ScanLine className="ml-auto h-6 w-6 opacity-80" />
          </div>
        </button>

        {last && (
          <section className="mt-5 rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-xl">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Ostatni produkt</p>
            <h2 className="mt-1 text-2xl font-semibold leading-tight tracking-tight">{last.name}</h2>
            <p className="mt-2 text-4xl font-black tracking-tight text-emerald-500">
              {currency(last.price)}
            </p>
          </section>
        )}

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold tracking-tight">Koszyk</h3>
            <span className="text-xs text-muted-foreground">
              {cart.count} {cart.count === 1 ? "pozycja" : cart.count % 10 >= 2 && cart.count % 10 <= 4 && (cart.count % 100 < 10 || cart.count % 100 >= 20) ? "pozycje" : "pozycji"}
            </span>
          </div>

          {cart.items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border/70 bg-card/40 p-8 text-center backdrop-blur">
              <p className="text-sm text-muted-foreground">
                Koszyk jest pusty. Zeskanuj kod EAN, aby dodać produkt.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {cart.items.map((item) => (
                <li
                  key={item.barcode}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/70 p-3 shadow-sm backdrop-blur"
                >
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-muted to-muted/60 text-muted-foreground">
                    <ScanLine className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{currency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/50 p-1">
                    <button
                      onClick={() => cart.setQuantity(item.barcode, item.quantity - 1)}
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                      aria-label="Zmniejsz"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => cart.setQuantity(item.barcode, item.quantity + 1)}
                      className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                      aria-label="Zwiększ"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => cart.remove(item.barcode)}
                    className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                    aria-label="Usuń"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {cart.items.length > 0 && (
          <section className="mt-6 rounded-3xl border border-border/60 bg-card/70 p-5 backdrop-blur-xl">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Razem</span>
              <span className="text-3xl font-black tracking-tight text-emerald-500 tabular-nums">
                {currency(cart.total)}
              </span>
            </div>
            <Link
              to="/platnosc"
              className="mt-4 flex items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-500/30 active:scale-[0.99]"
            >
              ZAPŁAĆ · {currency(cart.total)}
            </Link>
          </section>
        )}
      </main>

      <BarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleDetected}
        busy={busy}
      />
      <ErrorDialog
        open={!!error}
        title={error?.title ?? ""}
        message={error?.message ?? ""}
        onClose={() => setError(null)}
      />
    </AppShell>
  );
}

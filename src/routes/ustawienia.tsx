import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { DEFAULT_BACKEND_URL, getBackendUrl, setBackendUrl } from "@/lib/settings";

export const Route = createFileRoute("/ustawienia")({
  head: () => ({
    meta: [
      { title: "Ustawienia – PAYTEL OS" },
      { name: "description", content: "Konfiguracja terminala PAYTEL OS." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [url, setUrl] = useState(DEFAULT_BACKEND_URL);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setUrl(getBackendUrl());
  }, []);

  const save = () => {
    try {
      const clean = url.trim().replace(/\/+$/, "");
      new URL(clean);
      setBackendUrl(clean);
      setSaved(true);
      toast.success("Zapisano ustawienia");
      setTimeout(() => setSaved(false), 1500);
    } catch {
      toast.error("Nieprawidłowy adres URL");
    }
  };

  const reset = () => {
    setUrl(DEFAULT_BACKEND_URL);
    setBackendUrl(DEFAULT_BACKEND_URL);
    toast("Przywrócono adres domyślny");
  };

  return (
    <AppShell>
      <header className="px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <h1 className="text-2xl font-bold tracking-tight">Ustawienia</h1>
        <p className="text-sm text-muted-foreground">Konfiguracja terminala</p>
      </header>

      <main className="mx-auto max-w-md px-5 pt-5 space-y-4">
        <section className="rounded-3xl border border-border/60 bg-card/70 p-5 backdrop-blur-xl">
          <label htmlFor="backend" className="text-sm font-semibold">
            Adres backendu
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            Endpoint <code className="font-mono">POST /scan</code>
          </p>
          <input
            id="backend"
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            className="mt-3 w-full rounded-2xl border border-border bg-background/60 px-4 py-3 font-mono text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={save}
              className="flex-1 rounded-2xl bg-gradient-to-b from-emerald-500 to-emerald-600 py-3 font-semibold text-white shadow-md active:scale-[0.99]"
            >
              {saved ? "Zapisano ✓" : "Zapisz"}
            </button>
            <button
              onClick={reset}
              className="rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm font-medium"
            >
              Domyślny
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-card/70 p-5 backdrop-blur-xl">
          <h2 className="text-sm font-semibold">Informacje</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Wersja</dt>
              <dd className="font-medium">1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Aplikacja</dt>
              <dd className="font-medium">PAYTEL OS</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Domyślny backend</dt>
              <dd className="truncate font-mono text-xs">{DEFAULT_BACKEND_URL}</dd>
            </div>
          </dl>
        </section>
      </main>
    </AppShell>
  );
}
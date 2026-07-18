import { useCallback, useEffect, useRef, useState } from "react";
import { Flashlight, FlashlightOff, X, Loader2 } from "lucide-react";
import { startScanner, toggleTorch, type ScannerHandle } from "@/lib/scanner";
import { beep, vibrate } from "@/lib/beep";

interface Props {
  open: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
  busy?: boolean;
}

const DUP_WINDOW_MS = 1000;

export function BarcodeScanner({ open, onClose, onDetected, busy }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handleRef = useRef<ScannerHandle | null>(null);
  const lastRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });
  const [status, setStatus] = useState<"idle" | "starting" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [torchOn, setTorchOn] = useState(false);
  const [flash, setFlash] = useState(false);

  const stop = useCallback(() => {
    handleRef.current?.stop();
    handleRef.current = null;
    setStatus("idle");
    setTorchOn(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stop();
      return;
    }
    let cancelled = false;
    setStatus("starting");
    setErrorMsg("");
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Ta przeglądarka nie obsługuje kamery.");
        }
        const v = videoRef.current;
        if (!v) return;
        const handle = await startScanner(v, (code) => {
          const now = Date.now();
          if (lastRef.current.code === code && now - lastRef.current.at < DUP_WINDOW_MS) return;
          lastRef.current = { code, at: now };
          beep();
          vibrate(60);
          setFlash(true);
          setTimeout(() => setFlash(false), 450);
          onDetected(code);
        });
        if (cancelled) {
          handle.stop();
          return;
        }
        handleRef.current = handle;
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : "";
        const msg =
          name === "NotAllowedError" || name === "SecurityError"
            ? "Odmówiono dostępu do kamery. Zezwól w ustawieniach przeglądarki."
            : name === "NotFoundError"
              ? "Nie znaleziono kamery w tym urządzeniu."
              : err instanceof Error
                ? err.message
                : "Nie udało się uruchomić kamery.";
        setErrorMsg(msg);
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
      stop();
    };
  }, [open, onDetected, stop]);

  const onToggleTorch = async () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !torchOn;
    const ok = await toggleTorch(v, next);
    if (ok) setTorchOn(next);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black text-white">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        playsInline
        muted
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/70" />

      <div className="absolute inset-0 flex items-center justify-center px-8">
        <div
          className={`relative aspect-[4/3] w-full max-w-md rounded-3xl border-2 transition-all duration-300 ${
            flash ? "border-emerald-400 shadow-[0_0_80px_rgba(16,185,129,0.9)] scale-[1.03]" : "border-white/40"
          }`}
        >
          <span className="pointer-events-none absolute -top-1 left-6 h-6 w-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
          <span className="pointer-events-none absolute -top-1 right-6 h-6 w-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
          <span className="pointer-events-none absolute -bottom-1 left-6 h-6 w-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
          <span className="pointer-events-none absolute -bottom-1 right-6 h-6 w-6 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />
          {!flash && status === "ready" && (
            <span className="absolute left-4 right-4 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-emerald-400/80 shadow-[0_0_16px_rgba(16,185,129,0.9)] animate-pulse" />
          )}
        </div>
      </div>

      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          onClick={onClose}
          className="grid h-11 w-11 place-items-center rounded-full bg-black/40 backdrop-blur-md border border-white/10"
          aria-label="Zamknij skaner"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="rounded-full bg-black/40 px-4 py-2 text-sm font-medium backdrop-blur-md border border-white/10">
          {status === "starting" && "Uruchamianie kamery…"}
          {status === "ready" && (busy ? "Sprawdzanie…" : "Skieruj na kod")}
          {status === "error" && "Błąd"}
        </div>
        <button
          onClick={onToggleTorch}
          className="grid h-11 w-11 place-items-center rounded-full bg-black/40 backdrop-blur-md border border-white/10"
          aria-label="Latarka"
        >
          {torchOn ? <FlashlightOff className="h-5 w-5" /> : <Flashlight className="h-5 w-5" />}
        </button>
      </div>

      {status === "starting" && (
        <div className="absolute inset-x-0 bottom-24 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-x-6 bottom-10 rounded-2xl bg-black/70 p-5 text-center backdrop-blur-xl border border-white/10">
          <p className="text-base font-semibold">Kamera niedostępna</p>
          <p className="mt-1 text-sm text-white/70">{errorMsg}</p>
          <button
            onClick={onClose}
            className="mt-4 w-full rounded-xl bg-white/10 py-3 font-medium border border-white/10"
          >
            Zamknij
          </button>
        </div>
      )}
    </div>
  );
}
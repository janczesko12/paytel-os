import type { ScanResponse } from "./types";
import { getBackendUrl } from "./settings";

export class ScanError extends Error {
  constructor(
    public code: "network" | "timeout" | "invalid" | "offline",
    message: string,
  ) {
    super(message);
  }
}

export async function scanBarcode(barcode: string, timeoutMs = 12000): Promise<ScanResponse> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new ScanError("offline", "Brak połączenia z internetem.");
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const base = getBackendUrl().replace(/\/+$/, "");
  try {
    const res = await fetch(`${base}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barcode }),
      signal: controller.signal,
    });
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      throw new ScanError("invalid", "Nieprawidłowa odpowiedź serwera.");
    }
    if (!data || typeof data !== "object" || typeof (data as { success?: unknown }).success !== "boolean") {
      throw new ScanError("invalid", "Nieprawidłowa odpowiedź serwera.");
    }
    return data as ScanResponse;
  } catch (err) {
    if (err instanceof ScanError) throw err;
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ScanError("timeout", "Serwer nie odpowiada. Spróbuj ponownie.");
    }
    throw new ScanError("network", "Nie można połączyć się z serwerem.");
  } finally {
    clearTimeout(timer);
  }
}
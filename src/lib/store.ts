import { useCallback, useEffect, useState } from "react";
import type { CartItem, HistoryEntry } from "./types";

const CART_KEY = "paytel.cart";
const HISTORY_KEY = "paytel.history";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(`paytel:${key}`));
  } catch {
    /* ignore */
  }
}

function useLocalStore<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    setValue(read<T>(key, fallback));
    const handler = () => setValue(read<T>(key, fallback));
    window.addEventListener(`paytel:${key}`, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(`paytel:${key}`, handler);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = useCallback(
    (v: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
        write(key, next);
        return next;
      });
    },
    [key],
  );
  return [value, update];
}

export function useCart() {
  const [items, setItems] = useLocalStore<CartItem[]>(CART_KEY, []);

  const addProduct = useCallback(
    (p: { barcode: string; name: string; price: number }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.barcode === p.barcode);
        if (existing) {
          return prev.map((i) =>
            i.barcode === p.barcode ? { ...i, quantity: i.quantity + 1 } : i,
          );
        }
        return [...prev, { ...p, quantity: 1, addedAt: Date.now() }];
      });
    },
    [setItems],
  );

  const setQuantity = useCallback(
    (barcode: string, qty: number) => {
      setItems((prev) =>
        qty <= 0
          ? prev.filter((i) => i.barcode !== barcode)
          : prev.map((i) => (i.barcode === barcode ? { ...i, quantity: qty } : i)),
      );
    },
    [setItems],
  );

  const remove = useCallback(
    (barcode: string) => setItems((prev) => prev.filter((i) => i.barcode !== barcode)),
    [setItems],
  );
  const clear = useCallback(() => setItems([]), [setItems]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return { items, addProduct, setQuantity, remove, clear, total, count };
}

export function useHistory() {
  const [entries, setEntries] = useLocalStore<HistoryEntry[]>(HISTORY_KEY, []);
  const push = useCallback(
    (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
      setEntries((prev) =>
        [{ ...entry, id: crypto.randomUUID(), timestamp: Date.now() }, ...prev].slice(0, 500),
      );
    },
    [setEntries],
  );
  const clear = useCallback(() => setEntries([]), [setEntries]);
  return { entries, push, clear };
}
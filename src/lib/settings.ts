const KEY = "paytel.settings.backendUrl";
export const DEFAULT_BACKEND_URL = "https://paytel-os.onrender.com";

export function getBackendUrl(): string {
  if (typeof window === "undefined") return DEFAULT_BACKEND_URL;
  try {
    return window.localStorage.getItem(KEY) || DEFAULT_BACKEND_URL;
  } catch {
    return DEFAULT_BACKEND_URL;
  }
}

export function setBackendUrl(url: string) {
  try {
    window.localStorage.setItem(KEY, url);
  } catch {
    /* ignore */
  }
}
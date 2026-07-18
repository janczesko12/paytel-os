// Barcode scanning with native BarcodeDetector, falling back to @zxing/browser.
import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

export type ScanFormat =
  | "ean_13"
  | "ean_8"
  | "upc_a"
  | "upc_e"
  | "code_128"
  | "code_39";

export interface ScannerHandle {
  stop: () => void;
}

type Detected = { rawValue: string; format?: string };

interface NativeDetector {
  detect(source: HTMLVideoElement | ImageBitmapSource): Promise<Array<Detected>>;
}
interface NativeDetectorCtor {
  new (opts?: { formats?: string[] }): NativeDetector;
  getSupportedFormats?: () => Promise<string[]>;
}

const NATIVE_FORMATS: ScanFormat[] = [
  "ean_13",
  "ean_8",
  "upc_a",
  "upc_e",
  "code_128",
  "code_39",
];

function getNative(): NativeDetectorCtor | null {
  if (typeof window === "undefined") return null;
  const g = window as unknown as { BarcodeDetector?: NativeDetectorCtor };
  return g.BarcodeDetector ?? null;
}

export async function startScanner(
  video: HTMLVideoElement,
  onResult: (code: string, format: string) => void,
): Promise<ScannerHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: "environment" },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
    },
    audio: false,
  });
  video.srcObject = stream;
  video.setAttribute("playsinline", "true");
  video.muted = true;
  await video.play().catch(() => {});

  let stopped = false;
  let rafId = 0;
  let zxingControls: { stop: () => void } | null = null;

  const Native = getNative();
  let supported: string[] | null = null;
  if (Native?.getSupportedFormats) {
    try {
      supported = await Native.getSupportedFormats();
    } catch {
      supported = null;
    }
  }
  const useNative =
    !!Native && (!supported || NATIVE_FORMATS.some((f) => supported!.includes(f)));

  if (useNative && Native) {
    const detector = new Native({ formats: NATIVE_FORMATS });
    const loop = async () => {
      if (stopped) return;
      try {
        const codes = await detector.detect(video);
        if (codes && codes.length > 0) {
          const c = codes[0];
          onResult(c.rawValue, c.format || "unknown");
        }
      } catch {
        /* ignore per-frame errors */
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
  } else {
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: 120,
    });
    zxingControls = await reader.decodeFromStream(stream, video, (result) => {
      if (stopped) return;
      if (result) onResult(result.getText(), result.getBarcodeFormat().toString());
    });
  }

  return {
    stop: () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      zxingControls?.stop();
      for (const t of stream.getTracks()) t.stop();
    },
  };
}

export async function toggleTorch(
  video: HTMLVideoElement,
  on: boolean,
): Promise<boolean> {
  const stream = video.srcObject as MediaStream | null;
  const track = stream?.getVideoTracks?.()[0];
  if (!track) return false;
  const caps =
    (track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean }) || {};
  if (!caps.torch) return false;
  try {
    await track.applyConstraints({
      advanced: [{ torch: on } as MediaTrackConstraintSet & { torch?: boolean }],
    });
    return true;
  } catch {
    return false;
  }
}
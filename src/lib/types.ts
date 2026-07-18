export interface ScanSuccess {
  success: true;
  barcode: string;
  name: string;
  price: number;
}
export interface ScanFailure {
  success: false;
  message: string;
}
export type ScanResponse = ScanSuccess | ScanFailure;

export interface CartItem {
  barcode: string;
  name: string;
  price: number;
  quantity: number;
  addedAt: number;
}

export interface HistoryEntry {
  id: string;
  barcode: string;
  name: string | null;
  price: number | null;
  success: boolean;
  message?: string;
  timestamp: number;
}
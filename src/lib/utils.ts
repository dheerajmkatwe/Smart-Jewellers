import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function fmtDate(iso?: string): string {
  if (!iso) return '-';
  const parts = iso.split('-');
  if (parts.length < 3) return iso;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export function inr(n: number | string): string {
  const val = Number(n || 0);
  return '₹' + val.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

export function inr0(n: number | string): string {
  const val = Number(n || 0);
  return '₹' + val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function wt(n: number | string): string {
  return Number(n || 0).toFixed(3) + ' g';
}

export function pad(n: number, len: number = 4): string {
  return String(n).padStart(len, '0');
}

export function esc(s: string): string {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return (s == null ? '' : String(s)).replace(/[&<>"']/g, c => map[c] || c);
}

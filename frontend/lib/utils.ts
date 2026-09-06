import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(amount)
}
export function getRiskLevel(score: number) {
  if (score >= 75) return { level: 'critical', color: 'text-red-700 bg-red-100' }
  if (score >= 50) return { level: 'high', color: 'text-orange-700 bg-orange-100' }
  if (score >= 25) return { level: 'medium', color: 'text-yellow-700 bg-yellow-100' }
  return { level: 'low', color: 'text-green-700 bg-green-100' }
}
export const dataTypeConfig = {
  documented: { label: 'Documented', color: 'bg-green-100 text-green-800 border-green-300' },
  live_sync: { label: 'Live Sync', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  manual_scan: { label: 'Manual Scan', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  reference: { label: 'Reference', color: 'bg-red-100 text-red-800 border-red-300' }
} as const;

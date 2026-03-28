import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getStatusColor(status: string | null | undefined): string {
  switch (status) {
    case 'approved': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'rejected': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'under_review': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'pending':
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  }
}

export function getStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'approved': return 'Approved';
    case 'rejected': return 'Rejected';
    case 'under_review': return 'Under Review';
    case 'pending':
    default: return 'Pending';
  }
}

export function maskAadhaar(aadhaar: string): string {
  if (!aadhaar || aadhaar.length < 4) return '****';
  return `XXXX-XXXX-${aadhaar.slice(-4)}`;
}

export function maskAccountNumber(acc: string): string {
  if (!acc || acc.length < 4) return '****';
  return `${'*'.repeat(acc.length - 4)}${acc.slice(-4)}`;
}

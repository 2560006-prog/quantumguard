import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent-green)' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr>
      {Array(5).fill(0).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" style={{ color: 'var(--accent-green)' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    </div>
  );
}

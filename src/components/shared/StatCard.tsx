import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color?: 'green' | 'amber' | 'red' | 'blue' | 'purple';
  description?: string;
}

const colorMap = {
  green: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)', icon: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  amber: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)', icon: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  red: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)', icon: 'rgba(239,68,68,0.15)', text: '#ef4444' },
  blue: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.15)', icon: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
  purple: { bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.15)', icon: 'rgba(168,85,247,0.15)', text: '#a855f7' },
};

export default function StatCard({ label, value, icon: Icon, color = 'green', description }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className="rounded-xl p-5 transition-all"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: c.text, opacity: 0.8 }}>
            {label}
          </p>
          <p className="text-3xl font-bold" style={{ color: c.text }}>{value}</p>
          {description && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{description}</p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.icon }}>
          <Icon className="w-5 h-5" style={{ color: c.text }} />
        </div>
      </div>
    </div>
  );
}

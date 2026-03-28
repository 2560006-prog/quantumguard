import { cn, getStatusColor, getStatusLabel } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';

interface StatusBadgeProps {
  status: string | null | undefined;
  size?: 'sm' | 'md';
}

const statusIcons = {
  approved: CheckCircle2,
  rejected: XCircle,
  under_review: Eye,
  pending: Clock,
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const Icon = statusIcons[status as keyof typeof statusIcons] || Clock;
  return (
    <span className={cn('badge', getStatusColor(status), size === 'sm' && 'text-xs px-2 py-0.5')}>
      <Icon className={cn(size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      {getStatusLabel(status)}
    </span>
  );
}

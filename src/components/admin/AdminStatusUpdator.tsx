'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Clock, Loader2, RefreshCw } from 'lucide-react';

type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

interface Props {
  farmerId: string;
  currentStatus: VerificationStatus | null;
  farmerName: string;
}

const STATUS_OPTIONS: { value: VerificationStatus; label: string; color: string; bg: string; icon: React.ReactNode }[] = [
  { value: 'pending', label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock className="w-3.5 h-3.5" /> },
  { value: 'under_review', label: 'Under Review', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <RefreshCw className="w-3.5 h-3.5" /> },
  { value: 'approved', label: 'Approved', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { value: 'rejected', label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <XCircle className="w-3.5 h-3.5" /> },
];

export default function AdminStatusUpdater({ farmerId, currentStatus, farmerName }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [selected, setSelected] = useState<VerificationStatus>(currentStatus || 'pending');
  const [saving, setSaving] = useState(false);

  async function handleUpdate() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('verification_status')
        .upsert(
          { farmer_id: farmerId, status: selected, reviewed_at: new Date().toISOString() },
          { onConflict: 'farmer_id' }
        );

      if (error) throw error;
      toast.success(`Status updated to "${selected}"`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  }

  const selectedOption = STATUS_OPTIONS.find(o => o.value === selected);

  return (
    <div className="card p-5 mt-4">
      <p className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
        Update Status
      </p>
      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
        Manually override status for <span style={{ color: 'var(--text-secondary)' }}>{farmerName}</span>
      </p>

      <div className="space-y-2 mb-4">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSelected(opt.value)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all"
            style={{
              background: selected === opt.value ? opt.bg : 'transparent',
              border: `1px solid ${selected === opt.value ? opt.color + '40' : 'var(--border-subtle)'}`,
              color: selected === opt.value ? opt.color : 'var(--text-secondary)',
            }}
          >
            <span style={{ color: selected === opt.value ? opt.color : 'var(--text-muted)' }}>
              {opt.icon}
            </span>
            {opt.label}
          </button>
        ))}
      </div>

      <button
        onClick={handleUpdate}
        disabled={saving || selected === currentStatus}
        className="btn-primary w-full justify-center text-sm"
        style={saving || selected === currentStatus ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : selectedOption?.icon}
        {saving ? 'Updating...' : 'Apply Status'}
      </button>

      {selected === currentStatus && (
        <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
          Already set to this status
        </p>
      )}
    </div>
  );
}
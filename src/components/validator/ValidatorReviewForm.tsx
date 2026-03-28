'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, Clock, Loader2, MessageSquare } from 'lucide-react';

interface Props {
  farmerId: string;
  currentStatus: string;
  currentRemarks: string;
  validatorId: string;
  verificationId?: string;
}

export default function ValidatorReviewForm({ farmerId, currentStatus, currentRemarks, validatorId, verificationId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState(currentStatus);
  const [remarks, setRemarks] = useState(currentRemarks);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const updateData = {
        status,
        validator_id: validatorId,
        validator_remarks: remarks,
        reviewed_at: status !== 'pending' ? new Date().toISOString() : null,
      };

      if (verificationId) {
        const { error } = await supabase
          .from('verification_status')
          .update(updateData)
          .eq('id', verificationId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('verification_status')
          .insert({ ...updateData, farmer_id: farmerId, user_id: validatorId });
        if (error) throw error;
      }

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: validatorId,
        action: `verification_${status}`,
        target_type: 'farmer_profile',
        target_id: farmerId,
        metadata: { status, remarks },
      });

      toast.success(`Status updated to ${status.replace('_', ' ')}`);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending', icon: Clock, color: '#94a3b8' },
    { value: 'under_review', label: 'Under Review', icon: Clock, color: '#f59e0b' },
    { value: 'approved', label: 'Approved', icon: CheckCircle2, color: '#22c55e' },
    { value: 'rejected', label: 'Rejected', icon: XCircle, color: '#ef4444' },
  ];

  return (
    <div className="card p-5 sticky top-6">
      <p className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
        Verification Decision
      </p>

      {/* Status options */}
      <div className="space-y-2 mb-4">
        {statusOptions.map(opt => {
          const Icon = opt.icon;
          const isSelected = status === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className="w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left"
              style={{
                background: isSelected ? `${opt.color}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSelected ? `${opt.color}40` : 'var(--border-subtle)'}`,
                color: isSelected ? opt.color : 'var(--text-muted)',
              }}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{opt.label}</span>
              {isSelected && (
                <div className="ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center"
                  style={{ borderColor: opt.color }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: opt.color }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Remarks */}
      <div className="mb-4">
        <label className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
          <MessageSquare className="w-3 h-3" /> Remarks
        </label>
        <textarea
          value={remarks}
          onChange={e => setRemarks(e.target.value)}
          className="input-field resize-none text-sm"
          rows={4}
          placeholder="Add notes or reason for decision..."
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="btn-primary w-full justify-center">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? 'Saving...' : 'Save Decision'}
      </button>

      {currentStatus !== 'pending' && (
        <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
          Previously: {currentStatus.replace('_', ' ')}
        </p>
      )}
    </div>
  );
}

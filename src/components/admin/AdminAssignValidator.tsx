'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { ShieldCheck, Loader2, UserCheck } from 'lucide-react';

interface Props {
  farmerId: string;
  currentValidatorId: string | null;
  validators: { id: string; full_name: string | null; email?: string }[];
  farmerName: string;
}

export default function AdminAssignValidator({ farmerId, currentValidatorId, validators, farmerName }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [selectedValidator, setSelectedValidator] = useState(currentValidatorId || '');
  const [saving, setSaving] = useState(false);

  async function handleAssign() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('farmer_profiles')
        .update({ assigned_validator_id: selectedValidator || null })
        .eq('id', farmerId);
      if (error) throw error;

      if (selectedValidator) {
        await supabase
          .from('verification_status')
          .upsert(
            { farmer_id: farmerId, status: 'under_review', validator_id: selectedValidator },
            { onConflict: 'farmer_id' }
          );
      }

      toast.success(selectedValidator ? 'Validator assigned!' : 'Validator removed');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to assign');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5 sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
        <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Assign Validator</p>
      </div>

      <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
        Assign a validator to review <span style={{ color: 'var(--text-secondary)' }}>{farmerName}</span>
      </p>

      <select
        value={selectedValidator}
        onChange={e => setSelectedValidator(e.target.value)}
        className="input-field text-sm mb-3"
      >
        <option value="">— No Validator —</option>
        {validators.map(v => (
          <option key={v.id} value={v.id}>
            {v.full_name || v.email || v.id}
          </option>
        ))}
      </select>

      <button
        onClick={handleAssign}
        disabled={saving}
        className="btn-primary w-full justify-center text-sm"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
        {saving ? 'Saving...' : 'Save Assignment'}
      </button>

      {currentValidatorId && (
        <p className="text-xs text-center mt-3" style={{ color: 'var(--text-muted)' }}>
          Currently assigned
        </p>
      )}
    </div>
  );
}
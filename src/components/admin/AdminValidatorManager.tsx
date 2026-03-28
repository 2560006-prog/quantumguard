'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { UserPlus, Loader2, X } from 'lucide-react';

interface Props {
  farmers: { id: string; email: string; full_name: string | null }[];
}

export default function AdminValidatorManager({ farmers }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [saving, setSaving] = useState(false);

  async function handlePromote() {
    if (!selectedUserId) { toast.error('Select a user'); return; }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'validator' })
        .eq('id', selectedUserId);
      if (error) throw error;
      toast.success('User promoted to Validator!');
      setOpen(false);
      setSelectedUserId('');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary text-sm">
        <UserPlus className="w-4 h-4" />
        Add Validator
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="card p-6 w-full max-w-md animate-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>Promote User to Validator</h2>
              <button onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Select a registered farmer account to promote to validator role.
            </p>

            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Select User
            </label>
            <select
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="input-field mb-4">
              <option value="">— Select a user —</option>
              {farmers.map(f => (
                <option key={f.id} value={f.id}>
                  {f.full_name ? `${f.full_name} (${f.email})` : f.email}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="btn-secondary flex-1 justify-center">
                Cancel
              </button>
              <button onClick={handlePromote} disabled={saving || !selectedUserId} className="btn-primary flex-1 justify-center">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {saving ? 'Promoting...' : 'Promote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

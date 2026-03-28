'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Save, Loader2, User, Mail, Phone } from 'lucide-react';

export default function AdminSettingsClient({ user }: { user: any }) {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName, phone })
        .eq('id', user.id);
      
      if (error) throw error;
      toast.success('Settings saved!');
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <p className="section-label">Account Information</p>
        <div className="space-y-4">

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                value={user?.email ?? ''}
                disabled
                className="input-field pl-9 opacity-50 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="input-field pl-9"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="input-field pl-9"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>
              Role: {user?.role ?? 'admin'}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}

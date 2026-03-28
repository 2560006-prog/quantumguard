'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { UserMinus, Loader2 } from 'lucide-react';

interface Props {
  userId: string;
  currentRole: string;
  userName: string;
}

export default function AdminRoleChanger({ userId, currentRole, userName }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function handleDemote() {
    if (!confirm(`Demote "${userName}" back to farmer?`)) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'farmer' })
        .eq('id', userId);
      if (error) throw error;
      toast.success('User demoted to farmer');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  if (currentRole !== 'validator') return null;

  return (
    <button
      onClick={handleDemote}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.15)',
        color: '#ef4444',
      }}>
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
      Demote
    </button>
  );
}

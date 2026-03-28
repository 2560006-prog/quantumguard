'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Trash2, Loader2 } from 'lucide-react';

interface Props {
  farmerId: string;
  farmerName: string;
  validators: { id: string; full_name: string | null }[];
}

export default function AdminFarmerActions({ farmerId, farmerName }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete farmer "${farmerName}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      // Delete verification status
      await supabase.from('verification_status').delete().eq('farmer_id', farmerId);
      // Delete documents
      await supabase.from('documents').delete().eq('farmer_id', farmerId);
      // Delete profile
      const { error } = await supabase.from('farmer_profiles').delete().eq('id', farmerId);
      if (error) throw error;
      toast.success('Farmer deleted');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button onClick={handleDelete} disabled={deleting}
      className="p-1.5 rounded-lg transition-colors hover:bg-red-500/10" title="Delete farmer">
      {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" /> : <Trash2 className="w-3.5 h-3.5 text-red-400" />}
    </button>
  );
}

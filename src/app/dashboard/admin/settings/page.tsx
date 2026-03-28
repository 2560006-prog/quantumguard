import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminSettingsClient from '@/components/admin/AdminSettingsClient';

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/auth/login');

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="p-6 max-w-2xl mx-auto animate-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage your admin account</p>
      </div>
      <AdminSettingsClient user={userData as any} />
    </div>
  );
}

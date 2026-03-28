import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/shared/Sidebar';

export default async function FarmerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const role = (userData as { role?: string } | null)?.role || 'farmer';

  if (!userData || role !== 'farmer') {
    redirect(`/dashboard/${role}`);
  }

  const name = (userData as { full_name?: string } | null)?.full_name
    || user.email?.split('@')[0]
    || 'Farmer';

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="farmer" userName={name} userEmail={user.email || ''} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

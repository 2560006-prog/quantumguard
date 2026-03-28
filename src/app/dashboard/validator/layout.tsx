import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/shared/Sidebar';

export default async function ValidatorLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single();
  if (!userData || !['validator', 'admin'].includes(userData.role)) {
    redirect(`/dashboard/${userData?.role || 'farmer'}`);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="validator" userName={userData.full_name || user.email?.split('@')[0] || 'Validator'} userEmail={user.email || ''} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

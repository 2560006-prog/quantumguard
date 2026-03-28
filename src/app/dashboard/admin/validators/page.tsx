import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { ShieldCheck } from 'lucide-react';
import AdminValidatorManager from '@/components/admin/AdminValidatorManager';

export default async function AdminValidatorsPage() {
  const supabase = await createClient();

  const { data: validators } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'validator')
    .order('created_at', { ascending: false });

  const { data: farmers } = await supabase
    .from('users')
    .select('id, email, full_name')
    .eq('role', 'farmer');

  // Get review counts per validator
  const { data: reviews } = await supabase
    .from('verification_status')
    .select('validator_id')
    .not('validator_id', 'is', null);

  const reviewCounts: Record<string, number> = {};
  reviews?.forEach(r => {
    if (r.validator_id) reviewCounts[r.validator_id] = (reviewCounts[r.validator_id] || 0) + 1;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Validators</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage validator accounts and permissions</p>
        </div>
        <AdminValidatorManager farmers={farmers || []} />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Validator', 'Email', 'Reviews Done', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!validators || validators.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-10" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No validators yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Promote a farmer user to validator using the button above
                  </p>
                </td>
              </tr>
            ) : validators.map(v => (
              <tr key={v.id} className="table-row">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                      {v.full_name?.charAt(0)?.toUpperCase() || 'V'}
                    </div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {v.full_name || 'Unnamed Validator'}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{v.email}</td>
                <td className="px-4 py-3">
                  <span className="text-sm font-semibold" style={{ color: 'var(--accent-green)' }}>
                    {reviewCounts[v.id] || 0}
                  </span>
                  <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>reviews</span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(v.created_at)}</td>
                <td className="px-4 py-3">
                  <AdminRoleChanger userId={v.id} currentRole="validator" userName={v.full_name || v.email} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Server component inline demote button wrapper
import AdminRoleChanger from '@/components/admin/AdminRoleChanger';

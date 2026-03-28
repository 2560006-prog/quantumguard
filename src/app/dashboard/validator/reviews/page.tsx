import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import { ChevronRight, ClipboardCheck } from 'lucide-react';

export default async function ValidatorReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: reviews } = await supabase
    .from('verification_status')
    .select('*, farmer:farmer_id(full_name, crop_type, land_area, land_unit)')
    .eq('validator_id', user!.id)
    .order('reviewed_at', { ascending: false });

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Reviews</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>All verifications you have reviewed</p>
      </div>

      <div className="card overflow-hidden">
        {!reviews || reviews.length === 0 ? (
          <div className="p-16 text-center">
            <ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)' }}>No reviews yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Farmer', 'Crop', 'Status', 'Reviewed On', 'Remarks', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reviews.map((r: Record<string, unknown>) => {
                const farmer = r.farmer as { full_name?: string; crop_type?: string; land_area?: number; land_unit?: string } | null;
                return (
                  <tr key={r.id as string} className="table-row">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {farmer?.full_name || 'Unknown'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{farmer?.crop_type}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status as string} size="sm" /></td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(r.reviewed_at as string)}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs max-w-32 truncate" style={{ color: 'var(--text-muted)' }}>
                        {(r.validator_remarks as string) || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/validator/farmers/${r.farmer_id as string}`}
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: 'var(--accent-green)' }}>
                        View <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import { Search, ChevronRight, User } from 'lucide-react';

export default async function ValidatorFarmersPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const supabase = await createClient();
  const statusFilter = searchParams.status || 'all';
  const searchQuery = searchParams.search || '';

  let query = supabase.from('farmer_overview').select('*').order('created_at', { ascending: false });

  if (statusFilter !== 'all') {
    if (statusFilter === 'pending') {
      query = query.or('status.is.null,status.eq.pending');
    } else {
      query = query.eq('status', statusFilter);
    }
  }

  const { data: farmers } = await query;
  const filtered = farmers?.filter(f =>
    !searchQuery ||
    f.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.farmer_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.crop_type?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>All Farmers</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Review and verify farmer applications</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
          {tabs.map(tab => (
            <Link key={tab.key}
              href={`/dashboard/validator/farmers?status=${tab.key}${searchQuery ? `&search=${searchQuery}` : ''}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === tab.key ? 'text-black' : ''}`}
              style={statusFilter === tab.key
                ? { background: 'var(--accent-green)', color: '#0a0f0d' }
                : { color: 'var(--text-muted)' }}>
              {tab.label}
            </Link>
          ))}
        </div>
        <div className="flex-1 max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <form>
            <input type="text" name="search" defaultValue={searchQuery}
              placeholder="Search farmers..."
              className="input-field pl-9 text-xs py-2"
            />
          </form>
        </div>
        <p className="text-sm ml-auto" style={{ color: 'var(--text-muted)' }}>{filtered.length} farmers</p>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Farmer', 'Crop', 'Land Area', 'Submitted', 'Status', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <User className="w-10 h-10 mx-auto mb-2 opacity-10" style={{ color: 'var(--text-muted)' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No farmers found</p>
                </td>
              </tr>
            ) : filtered.map(farmer => (
              <tr key={farmer.id} className="table-row">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                      {farmer.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{farmer.full_name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{farmer.farmer_email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{farmer.crop_type}</td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{farmer.land_area} {farmer.land_unit}</td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>{formatDate(farmer.created_at)}</td>
                <td className="px-4 py-3"><StatusBadge status={farmer.status || 'pending'} size="sm" /></td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/validator/farmers/${farmer.id}`}
                    className="flex items-center gap-1 text-xs font-medium"
                    style={{ color: 'var(--accent-green)' }}>
                    Review <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

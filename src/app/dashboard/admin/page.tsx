import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Users, ShieldCheck, Clock, CheckCircle2, XCircle, Eye, ArrowRight, TrendingUp } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { data: allFarmers } = await supabase.from('farmer_overview').select('*').order('created_at', { ascending: false });
  const { data: validators } = await supabase.from('users').select('*').eq('role', 'validator');
  const { data: allUsers } = await supabase.from('users').select('*').eq('role', 'farmer');

  const total = allFarmers?.length || 0;
  const pending = allFarmers?.filter(f => !f.status || f.status === 'pending').length || 0;
  const underReview = allFarmers?.filter(f => f.status === 'under_review').length || 0;
  const approved = allFarmers?.filter(f => f.status === 'approved').length || 0;
  const rejected = allFarmers?.filter(f => f.status === 'rejected').length || 0;

  const recentFarmers = allFarmers?.slice(0, 8) || [];

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Admin Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>System-wide overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Farmers" value={total} icon={Users} color="blue" description={`${allUsers?.length || 0} registered accounts`} />
        <StatCard label="Pending" value={pending} icon={Clock} color="amber" description="Awaiting review" />
        <StatCard label="Under Review" value={underReview} icon={Eye} color="purple" description="Being reviewed" />
        <StatCard label="Approved" value={approved} icon={CheckCircle2} color="green" description="Successfully verified" />
        <StatCard label="Rejected" value={rejected} icon={XCircle} color="red" description="Not approved" />
        <StatCard label="Validators" value={validators?.length || 0} icon={ShieldCheck} color="purple" description="Active reviewers" />
      </div>

      {/* Approval Rate */}
      {total > 0 && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Verification Progress</p>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {Math.round(((approved + rejected) / total) * 100)}% reviewed
            </p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full flex">
              <div className="h-full transition-all" style={{ width: `${(approved / total) * 100}%`, background: '#22c55e' }} />
              <div className="h-full transition-all" style={{ width: `${(rejected / total) * 100}%`, background: '#ef4444' }} />
              <div className="h-full transition-all" style={{ width: `${(underReview / total) * 100}%`, background: '#f59e0b' }} />
            </div>
          </div>
          <div className="flex items-center gap-5 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Approved</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Rejected</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Under Review</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} /> Pending</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-5">
        {/* Recent Farmers */}
        <div className="col-span-2 card overflow-hidden">
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Farmers</p>
            <Link href="/dashboard/admin/farmers" className="text-xs flex items-center gap-1" style={{ color: 'var(--accent-green)' }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {recentFarmers.map(farmer => (
              <Link key={farmer.id} href={`/dashboard/admin/farmers/${farmer.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                    {farmer.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{farmer.full_name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{farmer.crop_type} · {formatDate(farmer.created_at)}</p>
                  </div>
                </div>
                <StatusBadge status={farmer.status || 'pending'} size="sm" />
              </Link>
            ))}
          </div>
        </div>

        {/* Validators */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Validators</p>
            <Link href="/dashboard/admin/validators" className="text-xs flex items-center gap-1" style={{ color: 'var(--accent-green)' }}>
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {!validators || validators.length === 0 ? (
            <div className="p-8 text-center">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No validators yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {validators.map(v => (
                <div key={v.id} className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                    {v.full_name?.charAt(0)?.toUpperCase() || 'V'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {v.full_name || 'Validator'}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{v.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

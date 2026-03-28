import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Users, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';

export default async function ValidatorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Stats
  const { data: allFarmers } = await supabase.from('farmer_overview').select('*');
  const total = allFarmers?.length || 0;
  const pending = allFarmers?.filter(f => !f.status || f.status === 'pending').length || 0;
  const underReview = allFarmers?.filter(f => f.status === 'under_review').length || 0;
  const approved = allFarmers?.filter(f => f.status === 'approved').length || 0;
  const rejected = allFarmers?.filter(f => f.status === 'rejected').length || 0;

  // My reviews
  const myReviews = allFarmers?.filter(f => f.status === 'approved' || f.status === 'rejected').slice(0, 5) || [];

  // Pending items
  const pendingItems = allFarmers?.filter(f => !f.status || f.status === 'pending').slice(0, 5) || [];

  const { data: userData } = await supabase.from('users').select('full_name').eq('id', user!.id).single();

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Validator Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Review and verify farmer applications — {userData?.full_name || ''}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Farmers" value={total} icon={Users} color="blue" />
        <StatCard label="Pending Review" value={pending + underReview} icon={Clock} color="amber" />
        <StatCard label="Approved" value={approved} icon={CheckCircle2} color="green" />
        <StatCard label="Rejected" value={rejected} icon={XCircle} color="red" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Pending Queue */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Pending Review</p>
            <Link href="/dashboard/validator/farmers" className="text-xs flex items-center gap-1" style={{ color: 'var(--accent-green)' }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {pendingItems.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: '#22c55e' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>All caught up!</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {pendingItems.map(farmer => (
                <Link key={farmer.id} href={`/dashboard/validator/farmers/${farmer.id}`}
                  className="flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{farmer.full_name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{farmer.crop_type} · {formatDate(farmer.created_at)}</p>
                  </div>
                  <StatusBadge status={farmer.status || 'pending'} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Recent Reviews</p>
            <Link href="/dashboard/validator/reviews" className="text-xs flex items-center gap-1" style={{ color: 'var(--accent-green)' }}>
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {myReviews.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No reviews yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {myReviews.map(farmer => (
                <Link key={farmer.id} href={`/dashboard/validator/farmers/${farmer.id}`}
                  className="flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{farmer.full_name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(farmer.reviewed_at)}</p>
                  </div>
                  <StatusBadge status={farmer.status} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

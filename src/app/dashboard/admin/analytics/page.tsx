import { createClient } from '@/lib/supabase/server';
import { BarChart3, TrendingUp, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const { data: farmers } = await supabase.from('farmer_overview').select('*');
  const { data: validators } = await supabase.from('users').select('id').eq('role', 'validator');
  const { data: docs } = await supabase.from('documents').select('id, document_type');

  const total = farmers?.length || 0;
  const approved = farmers?.filter(f => f.status === 'approved').length || 0;
  const rejected = farmers?.filter(f => f.status === 'rejected').length || 0;
  const pending = farmers?.filter(f => !f.status || f.status === 'pending').length || 0;
  const underReview = farmers?.filter(f => f.status === 'under_review').length || 0;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  // Crop distribution
  const cropCounts: Record<string, number> = {};
  farmers?.forEach(f => {
    if (f.crop_type) cropCounts[f.crop_type] = (cropCounts[f.crop_type] || 0) + 1;
  });
  const topCrops = Object.entries(cropCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxCrop = topCrops[0]?.[1] || 1;

  // Document type distribution
  const docTypeCounts: Record<string, number> = {};
  docs?.forEach(d => {
    docTypeCounts[d.document_type] = (docTypeCounts[d.document_type] || 0) + 1;
  });

  const docTypeLabels: Record<string, string> = {
    identity: 'Identity Proof',
    land: 'Land Document',
    bank: 'Bank Document',
    crop: 'Crop Certificate',
    other: 'Other',
  };

  const stats = [
    { label: 'Total Farmers', value: total, icon: Users, color: '#3b82f6' },
    { label: 'Approved', value: approved, icon: CheckCircle2, color: '#22c55e' },
    { label: 'Rejected', value: rejected, icon: XCircle, color: '#ef4444' },
    { label: 'Pending', value: pending, icon: Clock, color: '#f59e0b' },
    { label: 'Under Review', value: underReview, icon: Clock, color: '#a855f7' },
    { label: 'Validators', value: validators?.length || 0, icon: Users, color: '#f59e0b' },
    { label: 'Documents', value: docs?.length || 0, icon: BarChart3, color: '#3b82f6' },
    { label: 'Approval Rate', value: `${approvalRate}%`, icon: TrendingUp, color: '#22c55e' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>System-wide statistics and insights</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="card p-5">
          <p className="section-label">Verification Status Breakdown</p>
          <div className="space-y-3">
            {[
              { label: 'Approved', value: approved, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
              { label: 'Pending', value: pending, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
              { label: 'Under Review', value: underReview, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
              { label: 'Rejected', value: rejected, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span className="text-xs font-bold" style={{ color: item.color }}>
                    {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: total > 0 ? `${(item.value / total) * 100}%` : '0%',
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crop distribution */}
        <div className="card p-5">
          <p className="section-label">Top Crops</p>
          {topCrops.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No data yet</p>
          ) : (
            <div className="space-y-2.5">
              {topCrops.map(([crop, count]) => (
                <div key={crop}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{crop}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--accent-green)' }}>{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(count / maxCrop) * 100}%`, background: 'var(--accent-green)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Document types */}
        <div className="card p-5 col-span-2">
          <p className="section-label">Document Types Uploaded</p>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(docTypeCounts).map(([type, count]) => (
              <div key={type} className="rounded-xl p-4 text-center"
                style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
                <p className="text-2xl font-bold mb-1" style={{ color: 'var(--accent-green)' }}>{count}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{docTypeLabels[type] || type}</p>
              </div>
            ))}
            {Object.keys(docTypeCounts).length === 0 && (
              <div className="col-span-5 text-center py-8">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No documents uploaded yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

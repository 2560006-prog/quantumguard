import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import { CheckCircle2, Clock, XCircle, Eye, User, Calendar, MessageSquare } from 'lucide-react';

const steps = [
  { key: 'submitted', label: 'Profile Submitted', icon: CheckCircle2 },
  { key: 'under_review', label: 'Under Review', icon: Eye },
  { key: 'decision', label: 'Decision Made', icon: CheckCircle2 },
];

export default async function FarmerStatusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('farmer_profiles')
    .select('*')
    .eq('user_id', user!.id)
    .single();

  const { data: vs } = profile
    ? await supabase
        .from('verification_status')
        .select('*')
        .eq('farmer_id', profile.id)
        .single()
    : { data: null };

  // fetch validator name separately to avoid type issues
  let validatorName: string | null = null;
  const vsData = vs as { status?: string; validator_id?: string; validator_remarks?: string; reviewed_at?: string; created_at?: string } | null;
  if (vsData?.validator_id) {
    const { data: vUser } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', vsData.validator_id)
      .single();
    validatorName = (vUser as { full_name?: string } | null)?.full_name || null;
  }

  const status = vsData?.status || null;

  const currentStep = !profile ? -1
    : status === 'pending' ? 0
    : status === 'under_review' ? 1
    : 2;

  return (
    <div className="p-6 max-w-2xl mx-auto animate-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Verification Status</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Track the progress of your farm verification
        </p>
      </div>

      {!profile ? (
        <div className="card p-8 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>No Profile Found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Complete your profile to start verification
          </p>
        </div>
      ) : (
        <>
          <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Current Status</p>
              <StatusBadge status={status} />
            </div>

            <div className="flex items-center gap-0">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center border-2"
                        style={{
                          background: isCompleted ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
                          borderColor: isCompleted ? 'rgba(34,197,94,0.5)' : 'var(--border-subtle)',
                        }}>
                        <step.icon className="w-4 h-4"
                          style={{ color: isCompleted ? '#22c55e' : 'var(--text-muted)' }} />
                      </div>
                      <p className="text-xs mt-1.5 text-center w-20"
                        style={{ color: isCurrent ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                        {step.label}
                      </p>
                    </div>
                    {idx < steps.length - 1 && (
                      <div className="flex-1 h-px mx-2 mb-5"
                        style={{ background: idx < currentStep ? 'rgba(34,197,94,0.3)' : 'var(--border-subtle)' }} />
                    )}
                  </div>
                );
              })}
            </div>

            {(status === 'approved' || status === 'rejected') && (
              <div className="mt-4 p-4 rounded-xl flex items-center gap-3"
                style={{
                  background: status === 'approved' ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${status === 'approved' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                {status === 'approved'
                  ? <CheckCircle2 className="w-5 h-5" style={{ color: '#22c55e' }} />
                  : <XCircle className="w-5 h-5" style={{ color: '#ef4444' }} />}
                <div>
                  <p className="font-semibold text-sm"
                    style={{ color: status === 'approved' ? '#22c55e' : '#ef4444' }}>
                    {status === 'approved' ? 'Verification Approved!' : 'Verification Rejected'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {status === 'approved'
                      ? 'Your farm has been verified successfully.'
                      : 'Your application was not approved. See remarks below.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {vsData && (
            <div className="card p-5">
              <p className="section-label">Review Details</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Submitted On</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatDate(vsData.created_at || '')}
                    </p>
                  </div>
                </div>
                {vsData.reviewed_at && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Reviewed On</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {formatDate(vsData.reviewed_at)}
                      </p>
                    </div>
                  </div>
                )}
                {validatorName && (
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Reviewed By</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {validatorName}
                      </p>
                    </div>
                  </div>
                )}
                {vsData.validator_remarks && (
                  <div className="flex items-start gap-3">
                    <MessageSquare className="w-4 h-4 mt-0.5" style={{ color: 'var(--text-muted)' }} />
                    <div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Validator Remarks</p>
                      <p className="text-sm p-3 rounded-lg"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-subtle)'
                        }}>
                        {vsData.validator_remarks}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

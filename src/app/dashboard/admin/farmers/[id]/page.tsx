import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatDate, maskAadhaar, maskAccountNumber } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import DocumentViewer from '@/components/validator/DocumentViewer';
import AdminAssignValidator from '@/components/admin/AdminAssignValidator';
import AdminStatusUpdater from '@/components/admin/AdminStatusUpdater';
import { User, Phone, MapPin, Landmark, Calendar, MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default async function AdminFarmerDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: profile } = await supabase.from('farmer_profiles').select('*').eq('id', params.id).single();
  if (!profile) notFound();
  const p = profile as any;

  const { data: farmerUser } = await supabase.from('users').select('email, full_name').eq('id', p.user_id).single();
  const { data: vs } = await supabase.from('verification_status').select('*').eq('farmer_id', params.id).single();
  const v = vs as any;

  let validatorName = null;
  if (v?.validator_id) {
    const { data: vUser } = await supabase.from('users').select('full_name').eq('id', v.validator_id).single();
    validatorName = (vUser as any)?.full_name ?? null;
  }

  const { data: docs } = await supabase.from('documents').select('*').eq('farmer_id', params.id);
  const { data: validators } = await supabase.from('users').select('id, full_name, email').eq('role', 'validator');

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {p.profile_photo_url ? (
            <div className="w-16 h-16 rounded-full overflow-hidden relative border-2" style={{ borderColor: 'rgba(34,197,94,0.3)' }}>
              <Image src={p.profile_photo_url} alt={p.full_name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
              {p.full_name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{p.full_name}</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{(farmerUser as any)?.email}</p>
            <div className="mt-1"><StatusBadge status={v?.status ?? 'pending'} size="sm" /></div>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Submitted {formatDate(p.created_at)}</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left: Details */}
        <div className="col-span-2 space-y-5">
          <div className="card p-5">
            <p className="section-label">Personal Information</p>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={User} label="Full Name" value={p.full_name} />
              <InfoRow icon={Phone} label="Mobile" value={p.mobile_number} />
              <InfoRow icon={MapPin} label="Address" value={p.address} cols={2} />
              <InfoRow icon={User} label="Aadhaar" value={maskAadhaar(p.aadhaar_number)} />
              <InfoRow icon={Calendar} label="Submitted" value={formatDate(p.created_at)} />
            </div>
          </div>

          <div className="card p-5">
            <p className="section-label">Farm Details</p>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={MapPin} label="Crop Type" value={p.crop_type} />
              <InfoRow icon={MapPin} label="Land Area" value={`${p.land_area} ${p.land_unit}`} />
            </div>
          </div>

          <div className="card p-5">
            <p className="section-label">Bank Details</p>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={Landmark} label="Bank" value={p.bank_name} />
              <InfoRow icon={User} label="Account Holder" value={p.account_holder_name} />
              <InfoRow icon={Landmark} label="Account No." value={maskAccountNumber(p.account_number)} />
              <InfoRow icon={Landmark} label="IFSC" value={p.ifsc_code} />
            </div>
          </div>

          <div className="card p-5">
            <p className="section-label">Documents ({(docs ?? []).length})</p>
            <DocumentViewer documents={(docs ?? []) as any} farmerId={params.id} />
          </div>

          {v && (
            <div className="card p-5">
              <p className="section-label">Verification Details</p>
              <div className="space-y-3">
                {validatorName && (
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Reviewed by</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{validatorName}</p>
                  </div>
                )}
                {v.reviewed_at && (
                  <div>
                    <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Reviewed on</p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatDate(v.reviewed_at)}</p>
                  </div>
                )}
                {v.validator_remarks && (
                  <div>
                    <p className="text-xs mb-1 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <MessageSquare className="w-3 h-3" /> Remarks
                    </p>
                    <p className="text-sm p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                      {v.validator_remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Admin Actions */}
        <div className="col-span-1 space-y-4">
          {/* STATUS UPDATER - Admin can approve/reject directly */}
          <AdminStatusUpdater
            farmerId={params.id}
            currentStatus={v?.status ?? 'pending'}
            currentRemarks={v?.validator_remarks ?? ''}
            verificationId={v?.id}
          />

          {/* ASSIGN VALIDATOR */}
          <AdminAssignValidator
            farmerId={params.id}
            currentValidatorId={p.assigned_validator_id}
            validators={(validators ?? []) as any}
            farmerName={p.full_name}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, cols = 1 }: any) {
  return (
    <div className={cols === 2 ? 'col-span-2' : ''}>
      <p className="text-xs mb-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
        <Icon className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> {label}
      </p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value || '—'}</p>
    </div>
  );
}

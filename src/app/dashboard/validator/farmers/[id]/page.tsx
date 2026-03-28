import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatDate, maskAadhaar, maskAccountNumber } from '@/lib/utils';
import StatusBadge from '@/components/shared/StatusBadge';
import ValidatorReviewForm from '@/components/validator/ValidatorReviewForm';
import DocumentViewer from '@/components/validator/DocumentViewer';
import { User, Phone, MapPin, Crop, Landmark, Calendar } from 'lucide-react';
import Image from 'next/image';

export default async function FarmerDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('farmer_profiles')
    .select('*, user:user_id(*)')
    .eq('id', params.id)
    .single();

  if (!profile) notFound();

  const { data: vs } = await supabase
    .from('verification_status')
    .select('*')
    .eq('farmer_id', params.id)
    .single();

  const { data: docs } = await supabase
    .from('documents')
    .select('*')
    .eq('farmer_id', params.id)
    .order('created_at', { ascending: false });

  const p = profile as typeof profile & { user: { email: string } | null };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {profile.profile_photo_url ? (
            <div className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0 border-2"
              style={{ borderColor: 'rgba(34,197,94,0.3)' }}>
              <Image src={profile.profile_photo_url} alt={profile.full_name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
              {profile.full_name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{profile.full_name}</h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{p.user?.email}</p>
            <div className="mt-1"><StatusBadge status={vs?.status || 'pending'} size="sm" /></div>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Submitted {formatDate(profile.created_at)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left: Details */}
        <div className="col-span-2 space-y-5">
          {/* Personal Info */}
          <div className="card p-5">
            <p className="section-label">Personal Information</p>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={User} label="Full Name" value={profile.full_name} />
              <InfoRow icon={Phone} label="Mobile" value={profile.mobile_number} />
              <InfoRow icon={MapPin} label="Address" value={profile.address} cols={2} />
              <InfoRow icon={User} label="Aadhaar" value={maskAadhaar(profile.aadhaar_number)} />
              <InfoRow icon={Calendar} label="Submitted" value={formatDate(profile.created_at)} />
            </div>
          </div>

          {/* Farm Details */}
          <div className="card p-5">
            <p className="section-label">Farm Details</p>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={Crop} label="Crop Type" value={profile.crop_type} />
              <InfoRow icon={MapPin} label="Land Area" value={`${profile.land_area} ${profile.land_unit}`} />
            </div>
          </div>

          {/* Bank Details */}
          <div className="card p-5">
            <p className="section-label">Bank Details</p>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow icon={Landmark} label="Bank Name" value={profile.bank_name} />
              <InfoRow icon={User} label="Account Holder" value={profile.account_holder_name} />
              <InfoRow icon={Landmark} label="Account Number" value={maskAccountNumber(profile.account_number)} />
              <InfoRow icon={Landmark} label="IFSC Code" value={profile.ifsc_code} />
            </div>
          </div>

          {/* Documents */}
          <div className="card p-5">
            <p className="section-label">Documents ({docs?.length || 0})</p>
            <DocumentViewer documents={docs || []} farmerId={params.id} />
          </div>
        </div>

        {/* Right: Review Form */}
        <div className="col-span-1">
          <ValidatorReviewForm
            farmerId={params.id}
            currentStatus={vs?.status || 'pending'}
            currentRemarks={vs?.validator_remarks || ''}
            validatorId={user!.id}
            verificationId={vs?.id}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, cols = 1 }: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  cols?: number;
}) {
  return (
    <div className={cols === 2 ? 'col-span-2' : ''}>
      <p className="text-xs mb-0.5 flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
        <Icon className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> {label}
      </p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{value || '—'}</p>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { User, Phone, MapPin, CreditCard, Crop, Landmark, Upload, Loader2, Save, Camera } from 'lucide-react';
import Image from 'next/image';

const CROP_TYPES = ['Rice', 'Wheat', 'Corn/Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Groundnut', 'Onion', 'Tomato', 'Potato', 'Pulses', 'Vegetables', 'Fruits', 'Other'];

export default function FarmerProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    full_name: '',
    mobile_number: '',
    address: '',
    aadhaar_number: '',
    land_area: '',
    land_unit: 'acres',
    crop_type: '',
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setProfileId(profile.id);
        setForm({
          full_name: profile.full_name || '',
          mobile_number: profile.mobile_number || '',
          address: profile.address || '',
          aadhaar_number: profile.aadhaar_number || '',
          land_area: String(profile.land_area || ''),
          land_unit: profile.land_unit || 'acres',
          crop_type: profile.crop_type || '',
          bank_name: profile.bank_name || '',
          account_number: profile.account_number || '',
          ifsc_code: profile.ifsc_code || '',
          account_holder_name: profile.account_holder_name || '',
        });
        if (profile.profile_photo_url) setPhotoPreview(profile.profile_photo_url);
      } else {
        // Pre-fill name from user metadata
        const { data: userData } = await supabase.from('users').select('full_name').eq('id', user.id).single();
        if (userData?.full_name) setForm(f => ({ ...f, full_name: userData.full_name || '' }));
      }
      setFetchingProfile(false);
    }
    loadProfile();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo must be under 5MB'); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function uploadPhoto(userId: string): Promise<string | null> {
    if (!photoFile) return null;
    const ext = photoFile.name.split('.').pop();
    const path = `${userId}/profile.${ext}`;
    const { error } = await supabase.storage.from('profile-photos').upload(path, photoFile, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.mobile_number || !form.aadhaar_number || !form.land_area || !form.crop_type) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!/^\d{10}$/.test(form.mobile_number)) { toast.error('Enter valid 10-digit mobile number'); return; }
    if (!/^\d{12}$/.test(form.aadhaar_number)) { toast.error('Aadhaar must be 12 digits'); return; }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let photoUrl: string | null = photoPreview && !photoFile ? photoPreview : null;
      if (photoFile) photoUrl = await uploadPhoto(user.id);

      const profileData = {
        user_id: user.id,
        ...form,
        land_area: parseFloat(form.land_area),
        profile_photo_url: photoUrl,
      };

      let farmerId = profileId;
      if (profileId) {
        const { error } = await supabase.from('farmer_profiles').update(profileData).eq('id', profileId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('farmer_profiles').insert(profileData).select().single();
        if (error) throw error;
        farmerId = data.id;

        // Create initial verification status
        await supabase.from('verification_status').insert({
          farmer_id: farmerId!,
          user_id: user.id,
          status: 'pending',
        });

        // Update user full_name
        await supabase.from('users').update({ full_name: form.full_name }).eq('id', user.id);
      }

      toast.success(profileId ? 'Profile updated!' : 'Profile created and submitted for verification!');
      router.push('/dashboard/farmer');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (fetchingProfile) {
    return <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent-green)' }} /></div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto animate-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {profileId ? 'Edit Profile' : 'Complete Your Profile'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Fill in your details accurately to proceed with verification
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo */}
        <div className="card p-5">
          <p className="section-label">Profile Photo</p>
          <div className="flex items-center gap-5">
            <div
              onClick={() => photoInputRef.current?.click()}
              className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer overflow-hidden relative flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.08)', border: '2px dashed rgba(34,197,94,0.3)' }}>
              {photoPreview ? (
                <Image src={photoPreview} alt="Profile" fill className="object-cover" />
              ) : (
                <Camera className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />
              )}
            </div>
            <div>
              <button type="button" onClick={() => photoInputRef.current?.click()} className="btn-secondary text-xs">
                <Upload className="w-3.5 h-3.5" /> Upload Photo
              </button>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>JPG, PNG or WebP. Max 5MB.</p>
            </div>
            <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
        </div>

        {/* Personal Info */}
        <div className="card p-5">
          <p className="section-label">Personal Information</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input name="full_name" value={form.full_name} onChange={handleChange} className="input-field pl-9" placeholder="As per Aadhaar card" required />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mobile Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input name="mobile_number" value={form.mobile_number} onChange={handleChange} className="input-field pl-9" placeholder="10-digit number" maxLength={10} required />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Aadhaar Number *</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input name="aadhaar_number" value={form.aadhaar_number} onChange={handleChange} className="input-field pl-9" placeholder="12-digit Aadhaar" maxLength={12} required />
              </div>
            </div>
            <div className="col-span-2">
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Address *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <textarea name="address" value={form.address} onChange={handleChange} className="input-field pl-9 resize-none" rows={3} placeholder="Village, Taluka, District, State, Pincode" required />
              </div>
            </div>
          </div>
        </div>

        {/* Farm Details */}
        <div className="card p-5">
          <p className="section-label">Farm Details</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Land Area *</label>
              <div className="flex gap-2">
                <input name="land_area" type="number" step="0.01" min="0.01" value={form.land_area} onChange={handleChange}
                  className="input-field flex-1" placeholder="e.g. 2.5" required />
                <select name="land_unit" value={form.land_unit} onChange={handleChange} className="input-field w-28">
                  <option value="acres">Acres</option>
                  <option value="hectares">Hectares</option>
                  <option value="bigha">Bigha</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Crop Type *</label>
              <select name="crop_type" value={form.crop_type} onChange={handleChange} className="input-field" required>
                <option value="">Select crop</option>
                {CROP_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="card p-5">
          <p className="section-label flex items-center gap-2">
            <Landmark className="w-3.5 h-3.5" /> Bank Details
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Bank Name *</label>
              <input name="bank_name" value={form.bank_name} onChange={handleChange} className="input-field" placeholder="e.g. State Bank of India" required />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Account Holder Name *</label>
              <input name="account_holder_name" value={form.account_holder_name} onChange={handleChange} className="input-field" placeholder="As per passbook" required />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>Account Number *</label>
              <input name="account_number" value={form.account_number} onChange={handleChange} className="input-field" placeholder="Bank account number" required />
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>IFSC Code *</label>
              <input name="ifsc_code" value={form.ifsc_code} onChange={handleChange} className="input-field uppercase" placeholder="e.g. SBIN0001234" maxLength={11} required />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving...' : (profileId ? 'Update Profile' : 'Submit Profile')}
          </button>
        </div>
      </form>
    </div>
  );
}

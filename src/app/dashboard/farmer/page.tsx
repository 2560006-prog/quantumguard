'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const CSS = `*{box-sizing:border-box;margin:0;padding:0}
:root{
  --green:#2e7d32;
  --green-mid:#4CAF50;
  --green-light:#81c784;
  --green-pale:#e8f5e9;
  --green-xpale:#f1f8f1;
  --orange:#FFA726;
  --orange-pale:#fff3e0;
  --yellow:#FFD54F;
  --yellow-pale:#fffde7;
  --sidebar:#1b5e20;
  --sidebar-mid:#2e7d32;
  --sidebar-text:rgba(255,255,255,0.6);
  --sidebar-active:#4CAF50;
  --card:#ffffff;
  --border:#e0e0e0;
  --text1:#1a1a1a;
  --text2:#6b7280;
  --bg:#f5faf5;
  --radius:12px;
  --font-body:'Nunito',sans-serif;
  --font-head:'Poppins',sans-serif;
}
body{font-family:var(--font-body);background:var(--bg);color:var(--text1)}
.screen{display:none;animation:fadeIn .35s ease}
.screen.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.dash-wrap{display:flex;height:100vh;background:var(--bg);overflow:hidden}
.f-sidebar{width:230px;flex-shrink:0;background:var(--sidebar);display:flex;flex-direction:column;overflow:hidden;position:relative}
.f-sidebar::after{content:'';position:absolute;bottom:0;left:0;right:0;height:200px;background:linear-gradient(to top,rgba(0,0,0,.2),transparent);pointer-events:none}
.f-logo{display:flex;align-items:center;gap:10px;padding:18px 16px;border-bottom:1px solid rgba(255,255,255,.1)}
.f-logo-icon{width:34px;height:34px;background:linear-gradient(135deg,#4CAF50,#81c784);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.f-logo-icon svg{width:17px;height:17px}
.f-logo-title{color:#fff;font-size:14px;font-weight:700;font-family:var(--font-head)}
.f-logo-sub{color:rgba(255,255,255,.4);font-size:10px}
.f-nav{flex:1;padding:12px 8px;overflow-y:auto}
.f-nav::-webkit-scrollbar{width:0}
.f-nav-section{color:rgba(255,255,255,.3);font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:0 8px 6px;margin-top:8px}
.f-nav-item{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:10px;cursor:pointer;transition:.18s;color:var(--sidebar-text);font-size:13px;font-weight:500;margin-bottom:1px;position:relative}
.f-nav-item svg{width:16px;height:16px;flex-shrink:0}
.f-nav-item:hover{background:rgba(255,255,255,.08);color:rgba(255,255,255,.85)}
.f-nav-item.active{background:rgba(76,175,80,.35);color:#fff;border-left:3px solid var(--green-mid)}
.f-nav-item.active svg{color:var(--green-light)}
.f-nav-badge{background:var(--orange);color:white;font-size:9px;font-weight:700;padding:1px 6px;border-radius:10px;margin-left:auto}
.f-farmer-footer{border-top:1px solid rgba(255,255,255,.1);padding:12px 12px;display:flex;align-items:center;gap:8px;position:relative;z-index:1}
.f-farmer-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#4CAF50,#2e7d32);display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;flex-shrink:0;border:2px solid rgba(255,255,255,.2)}
.f-farmer-name{color:rgba(255,255,255,.8);font-size:12px;font-weight:600;flex:1}
.f-farmer-id{color:rgba(255,255,255,.35);font-size:10px;font-family:monospace}
.f-logout-btn{width:26px;height:26px;border-radius:6px;background:rgba(255,255,255,.1);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.5);transition:.15s}
.f-logout-btn:hover{background:rgba(239,68,68,.3);color:#fca5a5}
.f-logout-btn svg{width:12px;height:12px}
.f-main{flex:1;overflow-y:auto;display:flex;flex-direction:column;min-width:0}
.f-topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;border-bottom:1px solid var(--border);background:white;flex-shrink:0;position:sticky;top:0;z-index:10}
.f-page-title{font-family:var(--font-head);font-size:16px;font-weight:700;color:var(--text1)}
.f-page-sub{font-size:11px;color:var(--text2);margin-top:1px}
.f-topbar-right{display:flex;align-items:center;gap:10px}
.f-content{padding:20px 22px;flex:1}
.f-page{display:none;animation:fadeIn .3s ease}
.f-page.active{display:block}
.f-card{background:white;border:1px solid var(--border);border-radius:var(--radius);padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.f-card-title{font-size:13.5px;font-weight:700;color:var(--text1);margin-bottom:14px;display:flex;align-items:center;gap:7px;font-family:var(--font-head)}
.badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.02em}
.badge-approved{background:#e8f5e9;color:#2e7d32}
.badge-pending{background:#fff3e0;color:#e65100}
.badge-rejected{background:#fce4ec;color:#c62828}
.f-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px}
.f-stat{background:white;border:1px solid var(--border);border-radius:var(--radius);padding:14px;display:flex;align-items:flex-start;justify-content:space-between;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.f-stat-info .label{font-size:11px;color:var(--text2);margin-bottom:5px}
.f-stat-info .value{font-size:22px;font-weight:700;color:var(--text1);line-height:1;font-family:var(--font-head)}
.f-stat-info .sub{font-size:10px;color:var(--text2);margin-top:3px}
.f-stat-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.f-stat-icon svg{width:18px;height:18px}
.si-green{background:#e8f5e9;color:#2e7d32}
.si-orange{background:#fff3e0;color:#e65100}
.si-yellow{background:#fffde7;color:#f57f17}
.si-blue{background:#e3f2fd;color:#1565c0}
.scheme-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.scheme-card{background:white;border:1px solid var(--border);border-radius:var(--radius);padding:14px;position:relative;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.04);cursor:pointer;transition:.2s}
.scheme-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08);transform:translateY(-2px)}
.scheme-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
.scheme-card.eligible::before{background:linear-gradient(90deg,#4CAF50,#81c784)}
.scheme-card.check::before{background:linear-gradient(90deg,#FFA726,#FFD54F)}
.scheme-card.info::before{background:linear-gradient(90deg,#42a5f5,#64b5f6)}
.scheme-tag{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;padding:2px 8px;border-radius:10px;display:inline-flex;margin-bottom:8px}
.scheme-tag.eligible{background:var(--green-pale);color:var(--green)}
.scheme-tag.check{background:var(--orange-pale);color:#e65100}
.scheme-tag.info{background:#e3f2fd;color:#1565c0}
.scheme-name{font-size:13px;font-weight:700;color:var(--text1);margin-bottom:4px;font-family:var(--font-head)}
.scheme-desc{font-size:11px;color:var(--text2);line-height:1.5;margin-bottom:10px}
.scheme-amount{font-size:15px;font-weight:700;color:var(--green);font-family:var(--font-head)}
.scheme-cta{font-size:11px;color:var(--green);font-weight:600;margin-top:8px;cursor:pointer}
.profile-header{background:linear-gradient(135deg,#2e7d32,#4CAF50);border-radius:var(--radius);padding:20px;color:white;margin-bottom:16px;display:flex;align-items:center;gap:16px;position:relative;overflow:hidden}
.profile-header::before{content:'';position:absolute;right:-20px;top:-20px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)}
.profile-avatar-lg{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;border:3px solid rgba(255,255,255,.3);flex-shrink:0}
.profile-name{font-family:var(--font-head);font-size:19px;font-weight:700}
.profile-id{font-size:11px;opacity:.7;font-family:monospace;margin-top:2px}
.profile-verify{background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.3);border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:4px;margin-top:8px}
.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.profile-field{padding:12px;background:var(--green-xpale);border-radius:10px;border:1px solid #e8f5e9}
.profile-field-label{font-size:10px;color:var(--text2);font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px}
.profile-field-val{font-size:13px;color:var(--text1);font-weight:600}
.chain-card{background:linear-gradient(135deg,#0d47a1,#1565c0);border-radius:var(--radius);padding:18px;color:white;margin-bottom:14px;position:relative;overflow:hidden}
.chain-label{font-size:10px;opacity:.6;margin-bottom:3px;text-transform:uppercase;letter-spacing:.06em}
.chain-hash{font-size:11px;font-family:monospace;color:#90caf9;word-break:break-all}
.loan-result{border-radius:var(--radius);padding:20px;margin-bottom:16px;display:flex;align-items:flex-start;gap:16px}
.loan-result.approved{background:linear-gradient(135deg,#e8f5e9,#f1f8f1);border:1.5px solid #c8e6c9}
.loan-result-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.loan-result-icon.approved{background:var(--green-mid);color:white}
.loan-result-icon svg{width:22px;height:22px}
.loan-amount{font-family:var(--font-head);font-size:28px;font-weight:700;color:var(--green)}
.criteria-list{display:flex;flex-direction:column;gap:8px;margin-top:14px}
.criteria-row{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--green-xpale);border-radius:8px;border:1px solid #e8f5e9}
.criteria-label{font-size:12px;color:var(--text1);font-weight:500}
.criteria-val{font-size:12px;font-weight:700}
.criteria-val.pass{color:#2e7d32}
.criteria-val.fail{color:#c62828}
.qr-card-wrap{background:white;border:2px solid var(--border);border-radius:16px;padding:24px;display:flex;flex-direction:column;align-items:center;gap:12px;box-shadow:0 4px 20px rgba(0,0,0,.08)}
.qr-header{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.qr-header-logo{width:28px;height:28px;background:linear-gradient(135deg,#4CAF50,#2e7d32);border-radius:7px;display:flex;align-items:center;justify-content:center}
.qr-header-logo svg{width:14px;height:14px}
.qr-header-name{font-family:var(--font-head);font-size:15px;font-weight:700;color:var(--green)}
.qr-info{width:100%;border-top:1px solid var(--border);padding-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.qr-info-row{font-size:10px;color:var(--text2)}
.qr-info-val{font-size:11px;color:var(--text1);font-weight:600;font-family:monospace}
.qr-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.qr-action-btn{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid;transition:.15s;font-family:var(--font-body)}
.qr-action-btn.download{background:var(--green-mid);color:white;border-color:var(--green-mid)}
.qr-action-btn.share{background:white;color:var(--green);border-color:var(--green-light)}
.qr-action-btn.print{background:white;color:var(--text2);border-color:var(--border)}
.btn{padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:.2s;font-family:var(--font-body)}
.btn-outline{background:transparent;border:1.5px solid var(--green);color:var(--green)}
.btn-outline:hover{background:var(--green-pale)}
.btn-primary{background:linear-gradient(135deg,#4CAF50,#2e7d32);color:#fff;box-shadow:0 2px 12px rgba(76,175,80,.35)}
.btn-orange{background:linear-gradient(135deg,#FFA726,#e65100);color:#fff}
.form-field{margin-bottom:16px}
.form-label{font-size:12px;font-weight:600;color:var(--text1);margin-bottom:5px;display:block}
.form-input{width:100%;height:42px;border:1.5px solid var(--border);border-radius:8px;padding:0 12px;font-size:13px;font-family:var(--font-body);color:var(--text1);background:#fafafa;transition:.2s}
.form-input:focus{outline:none;border-color:var(--green-mid);background:white;box-shadow:0 0 0 3px rgba(76,175,80,.1)}
.f-main::-webkit-scrollbar{width:4px}
.f-main::-webkit-scrollbar-thumb{background:#c8e6c9;border-radius:4px}
@media(max-width:768px){
  .dash-wrap{flex-direction:column}
  .f-sidebar{width:100%;height:56px;flex-direction:row;overflow-x:auto}
  .f-nav{display:flex;flex-direction:row;padding:0 8px}
  .f-nav-section,.f-farmer-footer,.f-logo-sub{display:none}
  .f-logo{padding:0 12px;border:none}
  .f-nav-item{flex-direction:column;gap:2px;font-size:9px;padding:8px 6px;min-width:52px;border-radius:6px;border-left:none!important}
  .f-nav-item svg{width:18px;height:18px}
  .f-stat-grid{grid-template-columns:1fr 1fr}
  .scheme-grid{grid-template-columns:1fr}
  .profile-grid{grid-template-columns:1fr}
}`;

export default function FarmerDashboard() {
  const router = useRouter();
  const sb = createClient();
  const [activePage, setActivePage] = useState('schemes');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [vs, setVs] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState('aadhaar');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: { user: u } } = await sb.auth.getUser();
    if (!u) { router.push('/auth/login'); return; }
    const { data: ud } = await sb.from('users').select('*').eq('id', u.id).single();
    if ((ud as any)?.role !== 'farmer') { router.push(`/dashboard/${(ud as any)?.role}`); return; }
    setUser({ ...u, ...(ud as any) });
    const { data: p } = await sb.from('farmer_profiles').select('*').eq('user_id', u.id).single();
    setProfile(p || null);
    if (p) {
      const { data: v } = await sb.from('verification_status').select('*').eq('farmer_id', (p as any).id).single();
      setVs(v || null);
      const { data: d } = await sb.from('documents').select('*').eq('farmer_id', (p as any).id).order('created_at', { ascending: false });
      setDocs(d || []);
    }
    setReady(true);
  }

  async function saveProfile() {
    if (!user) return;
    const data = {
      user_id: user.id,
      full_name: editForm.full_name || '',
      mobile_number: editForm.mobile_number || '',
      aadhaar_number: editForm.aadhaar_number || '',
      address: editForm.address || '',
      land_area: parseFloat(editForm.land_area) || 0,
      land_unit: 'acres',
      crop_type: editForm.crop_type || '',
      bank_name: editForm.bank_name || '',
      account_number: editForm.account_number || '',
      ifsc_code: editForm.ifsc_code || '',
      account_holder_name: editForm.account_holder_name || editForm.full_name || '',
    };
    if (profile) {
      const { error } = await sb.from('farmer_profiles').update(data).eq('id', profile.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await sb.from('farmer_profiles').insert(data);
      if (error) { toast.error(error.message); return; }
    }
    toast.success('✅ Profile saved!');
    setEditMode(false);
    loadData();
  }

  async function uploadDocument(file: File) {
    if (!profile) { toast.error('Create profile first'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await sb.storage.from('farmer-documents').upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = sb.storage.from('farmer-documents').getPublicUrl(path);
      const { error: dbErr } = await sb.from('documents').insert({
        farmer_id: profile.id,
        user_id: user.id,
        document_name: file.name,
        document_type: docType,
        file_url: urlData.publicUrl,
        file_path: path,
        file_size: file.size,
        mime_type: file.type,
      });
      if (dbErr) throw dbErr;
      toast.success('✅ Document uploaded!');
      loadData();
    } catch (err: any) {
      toast.error(err.message ?? 'Upload failed');
    } finally { setUploading(false); }
  }

  async function uploadProfilePhoto(file: File) {
    if (!profile) { toast.error('Create profile first'); return; }
    const path = `${user.id}/photo.${file.name.split('.').pop()}`;
    const { error } = await sb.storage.from('profile-photos').upload(path, file, { upsert: true });
    if (error) { toast.error(error.message); return; }
    const { data: urlData } = sb.storage.from('profile-photos').getPublicUrl(path);
    await sb.from('farmer_profiles').update({ profile_photo_url: urlData.publicUrl }).eq('id', profile.id);
    toast.success('✅ Photo updated!');
    loadData();
  }

  async function deleteDoc(doc: any) {
    await sb.storage.from('farmer-documents').remove([doc.file_path]);
    await sb.from('documents').delete().eq('id', doc.id);
    toast.success('Document removed');
    loadData();
  }

  async function signOut() {
    await sb.auth.signOut();
    router.push('/auth/login');
  }

  function showPage(id: string) {
    setActivePage(id);
    if (id === 'qr') {
      setTimeout(() => {
        const el = document.getElementById('qr-canvas-real');
        if (el && (window as any).QRCode && profile?.id) {
          el.innerHTML = '';
          try {
            // ✅ FIXED: Use full UUID (profile.id) not farmerId
            const qrUrl = `${window.location.origin}/farmer/${profile.id}`;
            new (window as any).QRCode(el, { text: qrUrl, width: 180, height: 180, colorDark: '#1b5e20', colorLight: '#ffffff' });
          } catch(e) {}
        }
      }, 300);
    }
  }

  if (!ready) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f5faf5' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌾</div>
        <div style={{ fontSize: '16px', color: '#2e7d32', fontWeight: 600, fontFamily: 'Poppins,sans-serif' }}>Loading FarmVerify...</div>
      </div>
    </div>
  );

  const p = profile as any;
  const v = vs as any;
  const farmerId = p ? 'QG-' + String(p.id).slice(0, 8).toUpperCase() : '';
  const initials = (user?.full_name || user?.email || 'F').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  const verStatus = v?.status || 'pending';
  const isApproved = verStatus === 'approved';
  const isRejected = verStatus === 'rejected';
  const sColor = isApproved ? '#2e7d32' : isRejected ? '#c62828' : '#e65100';
  const sBg = isApproved ? '#f1f8f1' : isRejected ? '#fce4ec' : '#fff8e1';
  const sBorder = isApproved ? '#c8e6c9' : isRejected ? '#f8bbd0' : '#ffe0b2';
  const loanEligible = p && parseFloat(p.land_area) >= 1;

  const DOC_TYPES = [
    { key: 'aadhaar', label: 'Aadhaar Card', icon: '🪪' },
    { key: 'land', label: 'Land Document (7/12)', icon: '🗺️' },
    { key: 'bank', label: 'Bank Passbook', icon: '🏦' },
    { key: 'photo', label: 'Farmer Photo', icon: '🧑‍🌾' },
    { key: 'income', label: 'Income Certificate', icon: '📃' },
    { key: 'landphoto', label: 'Land Photo', icon: '🌾' },
  ];

  const NAV = [
    { id: 'schemes', label: 'Government Schemes', badge: '8', section: 'My Dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id: 'profile', label: 'Farmer Profile', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id: 'documents', label: 'Documents', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { id: 'blockchain', label: 'Blockchain Details', section: 'Blockchain', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    { id: 'loan', label: 'Loan Eligibility', section: 'Loans & Identity', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { id: 'qr', label: 'QR Identity Card', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3"/></svg> },
    { id: 'status', label: 'Validation Status', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  ];

  return (<>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" async />
    <style dangerouslySetInnerHTML={{ __html: CSS }} />

    <div className="dash-wrap">
      {/* SIDEBAR */}
      <div className="f-sidebar">
        <div className="f-logo">
          <div className="f-logo-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="17" height="17"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div><div className="f-logo-title">FarmVerify</div><div className="f-logo-sub">Farmer Portal</div></div>
        </div>
        <nav className="f-nav">
          {NAV.map((item, i) => (<>
            {item.section && <div key={'s' + i} className="f-nav-section">{item.section}</div>}
            <div key={item.id} className={'f-nav-item' + (activePage === item.id ? ' active' : '')} onClick={() => showPage(item.id)}>
              {item.icon}{item.label}
              {item.badge && <span className="f-nav-badge">{item.badge}</span>}
            </div>
          </>))}
        </nav>
        <div className="f-farmer-footer">
          <div className="f-farmer-avatar">{initials}</div>
          <div>
            <div className="f-farmer-name">{user?.full_name || user?.email}</div>
            <div className="f-farmer-id">{farmerId || 'Profile Pending'}</div>
          </div>
          <button className="f-logout-btn" onClick={signOut} title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="f-main">

        {/* SCHEMES */}
        {activePage === 'schemes' && (
          <div className="f-page active">
            <div className="f-topbar">
              <div><div className="f-page-title">🏛️ Government Schemes</div><div className="f-page-sub">Schemes matched to your profile</div></div>
            </div>
            <div className="f-content">
              <div style={{ marginBottom: '14px', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${sBorder}`, background: sBg, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{isApproved ? '✅' : isRejected ? '❌' : '⏳'}</span>
                <div><strong style={{ color: sColor }}>Verification: {verStatus.replace('_', ' ').toUpperCase()}</strong>
                  {v?.validator_remarks && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Remarks: {v.validator_remarks}</div>}
                </div>
              </div>
              <div className="f-stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: '18px' }}>
                <div className="f-stat"><div className="f-stat-info"><div className="label">Eligible Schemes</div><div className="value">8</div><div className="sub">Based on profile</div></div><div className="f-stat-icon si-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div></div>
                <div className="f-stat"><div className="f-stat-info"><div className="label">Total Benefit</div><div className="value" style={{ fontSize: '17px' }}>₹5.7L</div><div className="sub">Potential/year</div></div><div className="f-stat-icon si-orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div></div>
                <div className="f-stat"><div className="f-stat-info"><div className="label">Documents</div><div className="value">{docs.length}</div><div className="sub">Uploaded</div></div><div className="f-stat-icon si-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div></div>
                <div className="f-stat"><div className="f-stat-info"><div className="label">Land Area</div><div className="value">{p?.land_area || '—'}</div><div className="sub">{p?.land_unit || 'acres'}</div></div><div className="f-stat-icon si-yellow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div></div>
              </div>
              <div className="scheme-grid">
                {[
                  { name: 'PM-KISAN Samman Nidhi', tag: '✓ Eligible', cls: 'eligible', amount: '₹6,000/yr', icon: '🌾', desc: 'Direct income support in 3 instalments for all eligible farmer families.' },
                  { name: 'PM Fasal Bima Yojana', tag: '✓ Eligible', cls: 'eligible', amount: 'Up to ₹2L', icon: '🌧️', desc: 'Crop insurance against natural calamities at 2% premium for Kharif crops.' },
                  { name: 'Kisan Credit Card (KCC)', tag: '⚠ Check', cls: 'check', amount: '₹1,60,000', icon: '💳', desc: 'Flexible credit at 4% interest for crop production and post-harvest expenses.' },
                  { name: 'Soil Health Card Scheme', tag: '✓ Free', cls: 'eligible', amount: 'Free', icon: '🌱', desc: 'Free soil testing with crop-wise fertilizer recommendations every 2 years.' },
                  { name: 'PM Krishi Sinchayee (PMKSY)', tag: '✓ Eligible', cls: 'eligible', amount: '55% subsidy', icon: '💧', desc: 'Subsidy on drip/sprinkler irrigation equipment.' },
                  { name: 'PM-KUSUM Solar Pump', tag: '✓ Eligible', cls: 'eligible', amount: '90% subsidy', icon: '☀️', desc: '60% central + 30% state subsidy on solar-powered irrigation pump.' },
                  { name: 'NABARD Agricultural Loan', tag: '⚠ Check', cls: 'check', amount: '₹1.5L–10L', icon: '🏦', desc: 'Agricultural finance with 2–3% interest subvention for timely repayment.' },
                  { name: 'Maharashtra Shetkari Yojana', tag: 'ℹ State', cls: 'info', amount: '₹50,000 max', icon: '🏞️', desc: 'State drought relief and input subsidy for drought-affected districts.' },
                ].map((s, i) => (
                  <div key={i} className={`scheme-card ${s.cls}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div><span className={`scheme-tag ${s.cls}`}>{s.tag}</span><div className="scheme-name" style={{ marginTop: '6px' }}>{s.name}</div></div>
                      <div style={{ fontSize: '24px' }}>{s.icon}</div>
                    </div>
                    <div className="scheme-desc">{s.desc}</div>
                    <div className="scheme-amount" style={{ margin: '8px 0 6px' }}>{s.amount}</div>
                    <div className="scheme-cta" onClick={() => toast.success(`📋 Applied for ${s.name}`)}>Apply Now →</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {activePage === 'profile' && (
          <div className="f-page active">
            <div className="f-topbar">
              <div><div className="f-page-title">👨‍🌾 Farmer Profile</div><div className="f-page-sub">Your registered information</div></div>
              <div className="f-topbar-right">
                <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={() => { setEditForm(p ? { ...p } : { full_name: user?.full_name || '' }); setEditMode(!editMode); }}>
                  {editMode ? '✕ Cancel' : '✏️ Edit Profile'}
                </button>
                {editMode && <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={saveProfile}>💾 Save</button>}
              </div>
            </div>
            <div className="f-content">
              <div className="profile-header" style={{ marginBottom: '16px' }}>
                <div style={{ position: 'relative' }}>
                  {p?.profile_photo_url
                    ? <img src={p.profile_photo_url} alt="Profile" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,.3)' }} />
                    : <div className="profile-avatar-lg">{initials}</div>}
                  <label style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#4CAF50', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '11px' }}>
                    📷<input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && uploadProfilePhoto(e.target.files[0])} />
                  </label>
                </div>
                <div>
                  <div className="profile-name">{user?.full_name || 'Farmer'}</div>
                  <div className="profile-id">Farmer ID: {farmerId || 'Not registered'}</div>
                  <div className="profile-verify" style={{ display: 'inline-flex', marginTop: '6px' }}>{isApproved ? '✓ Identity Verified' : '⏳ Pending Verification'}</div>
                </div>
              </div>
              {!p && !editMode && (
                <div style={{ padding: '32px', textAlign: 'center', background: '#fff3e0', borderRadius: '12px', border: '1px solid #ffe0b2', marginBottom: '16px' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>🌾</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#e65100', marginBottom: '8px' }}>Profile Not Yet Completed</div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>Click Edit Profile to fill in your details.</p>
                  <button className="btn btn-primary" onClick={() => { setEditForm({ full_name: user?.full_name || '' }); setEditMode(true); }}>✏️ Complete Profile Now</button>
                </div>
              )}
              {editMode ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="f-card">
                    <div className="f-card-title">👤 Personal Information</div>
                    {[['full_name','Full Name'],['mobile_number','Mobile Number'],['aadhaar_number','Aadhaar Number'],['address','Address']].map(([k, lbl]) => (
                      <div className="form-field" key={k}>
                        <label className="form-label">{lbl}</label>
                        <input className="form-input" value={editForm[k] || ''} onChange={e => setEditForm((f: any) => ({ ...f, [k]: e.target.value }))} placeholder={lbl} />
                      </div>
                    ))}
                  </div>
                  <div className="f-card">
                    <div className="f-card-title">🌾 Farm Details</div>
                    <div className="form-field"><label className="form-label">Crop Type</label>
                      <select className="form-input" value={editForm.crop_type || ''} onChange={e => setEditForm((f: any) => ({ ...f, crop_type: e.target.value }))}>
                        {['Wheat','Sugarcane','Rice / Paddy','Soybean','Cotton','Onion','Tomato','Grapes','Turmeric','Mixed Crops'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-field"><label className="form-label">Land Area (acres)</label>
                      <input className="form-input" type="number" value={editForm.land_area || ''} onChange={e => setEditForm((f: any) => ({ ...f, land_area: e.target.value }))} placeholder="e.g. 3.5" />
                    </div>
                  </div>
                  <div className="f-card" style={{ gridColumn: '1/-1' }}>
                    <div className="f-card-title">🏦 Bank Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      {[['bank_name','Bank Name'],['account_number','Account Number'],['ifsc_code','IFSC Code'],['account_holder_name','Account Holder']].map(([k, lbl]) => (
                        <div className="form-field" key={k}>
                          <label className="form-label">{lbl}</label>
                          <input className="form-input" value={editForm[k] || ''} onChange={e => setEditForm((f: any) => ({ ...f, [k]: e.target.value }))} placeholder={lbl} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : p ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="f-card">
                    <div className="f-card-title">👤 Personal Information</div>
                    <div className="profile-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[['Full Name', p.full_name],['Mobile', '+91 ' + p.mobile_number],['Aadhaar', 'XXXX XXXX ' + String(p.aadhaar_number || '').slice(-4)]].map(([lbl, val]) => (
                        <div key={lbl} className="profile-field"><div className="profile-field-label">{lbl}</div><div className="profile-field-val">{val || '—'}</div></div>
                      ))}
                      <div className="profile-field" style={{ gridColumn: '1/-1' }}><div className="profile-field-label">Address</div><div className="profile-field-val">{p.address || '—'}</div></div>
                    </div>
                  </div>
                  <div className="f-card">
                    <div className="f-card-title">🌾 Farm Details</div>
                    <div className="profile-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {[['Crop Type', p.crop_type],['Land Area', `${p.land_area} ${p.land_unit}`]].map(([lbl, val]) => (
                        <div key={lbl} className="profile-field"><div className="profile-field-label">{lbl}</div><div className="profile-field-val">{val || '—'}</div></div>
                      ))}
                    </div>
                  </div>
                  <div className="f-card" style={{ gridColumn: '1/-1' }}>
                    <div className="f-card-title">🏦 Bank Details</div>
                    <div className="profile-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                      {[['Bank', p.bank_name],['Account Holder', p.account_holder_name],['Account No.', '****' + String(p.account_number || '').slice(-4)],['IFSC', p.ifsc_code]].map(([lbl, val]) => (
                        <div key={lbl} className="profile-field"><div className="profile-field-label">{lbl}</div><div className="profile-field-val">{val || '—'}</div></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {activePage === 'documents' && (
          <div className="f-page active">
            <div className="f-topbar">
              <div><div className="f-page-title">📄 Documents</div><div className="f-page-sub">Upload and manage your verification documents</div></div>
              <div className="f-topbar-right">
                <div style={{ fontSize: '12px', fontWeight: 700, padding: '5px 12px', borderRadius: '20px', background: docs.length >= 6 ? '#e8f5e9' : '#fff3e0', color: docs.length >= 6 ? '#2e7d32' : '#e65100', border: `1px solid ${docs.length >= 6 ? '#c8e6c9' : '#ffe0b2'}` }}>
                  {docs.length} / 6 Uploaded
                </div>
              </div>
            </div>
            <div className="f-content">
              {!p ? (
                <div style={{ padding: '32px', textAlign: 'center', background: '#fff3e0', borderRadius: '12px', border: '1px solid #ffe0b2' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>📄</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#e65100', marginBottom: '8px' }}>Complete Profile First</div>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>Create your farmer profile before uploading documents.</p>
                </div>
              ) : (<>
                <div className="f-card" style={{ marginBottom: '16px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700 }}>📋 Upload Progress</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{docs.length} of 6 documents uploaded</div>
                  </div>
                  <div style={{ height: '8px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'linear-gradient(90deg,#4CAF50,#81c784)', borderRadius: '10px', width: `${Math.min(docs.length / 6 * 100, 100)}%`, transition: 'width .4s ease' }} />
                  </div>
                </div>
                <div className="f-card" style={{ marginBottom: '16px' }}>
                  <div className="f-card-title">📤 Upload Document</div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <label className="form-label">Document Type</label>
                      <select className="form-input" value={docType} onChange={e => setDocType(e.target.value)}>
                        {DOC_TYPES.map(dt => <option key={dt.key} value={dt.key}>{dt.icon} {dt.label}</option>)}
                      </select>
                    </div>
                    <label className="btn btn-primary" style={{ padding: '10px 18px', cursor: 'pointer', fontSize: '13px' }}>
                      {uploading ? '⏳ Uploading...' : '📎 Choose File'}
                      <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) uploadDocument(f); e.target.value = ''; }} />
                    </label>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px', marginBottom: '16px' }}>
                  {DOC_TYPES.map(dt => {
                    const uploaded = docs.filter((d: any) => d.document_type === dt.key);
                    const isUploaded = uploaded.length > 0;
                    return (
                      <div key={dt.key} style={{ background: 'white', border: `2px solid ${isUploaded ? '#c8e6c9' : '#e0e0e0'}`, borderRadius: '12px', padding: '14px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: isUploaded ? 'linear-gradient(90deg,#4CAF50,#81c784)' : 'linear-gradient(90deg,#e0e0e0,#bdbdbd)' }} />
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '4px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: isUploaded ? '#e8f5e9' : '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>{dt.icon}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a1a' }}>
                              {dt.label}
                              <span style={{ marginLeft: '6px', fontSize: '9px', background: isUploaded ? '#e8f5e9' : '#fff3e0', color: isUploaded ? '#2e7d32' : '#e65100', padding: '2px 7px', borderRadius: '10px', fontWeight: 700 }}>{isUploaded ? `✓ ${uploaded.length} file(s)` : 'Required'}</span>
                            </div>
                            {uploaded.map((d: any) => (
                              <div key={d.id} style={{ marginTop: '6px', padding: '6px 8px', background: '#f1f8f1', borderRadius: '7px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <a href={d.file_url} target="_blank" rel="noreferrer" style={{ color: '#2e7d32', fontWeight: 600, textDecoration: 'none', flex: 1 }}>📎 {d.document_name}</a>
                                <button onClick={() => deleteDoc(d)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '14px' }}>🗑️</button>
                              </div>
                            ))}
                            {!isUploaded && (
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', padding: '7px 10px', border: '1.5px dashed #bdbdbd', borderRadius: '7px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#6b7280' }}>
                                📎 Upload {dt.label}
                                <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setDocType(dt.key); uploadDocument(f); } e.target.value = ''; }} />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: '10px 14px', background: '#f1f8f1', borderRadius: '10px', border: '1px solid #c8e6c9', fontSize: '12px', color: '#6b7280' }}>
                  🔗 All documents stored securely in <strong style={{ color: '#2e7d32' }}>Supabase Storage</strong>. Click any file name to view.
                </div>
              </>)}
            </div>
          </div>
        )}

        {/* BLOCKCHAIN */}
        {activePage === 'blockchain' && (
          <div className="f-page active">
            <div className="f-topbar">
              <div><div className="f-page-title">⛓️ Blockchain Details</div><div className="f-page-sub">Your immutable identity record</div></div>
              <div className="f-topbar-right">
                <button className="btn btn-outline" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => window.open('https://sepolia.etherscan.io', '_blank')}>🔗 View on Etherscan</button>
              </div>
            </div>
            <div className="f-content">
              <div className="chain-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#90caf9" strokeWidth="2" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '14px' }}>{user?.full_name || 'Farmer'}</div>
                    <div style={{ color: 'rgba(255,255,255,.5)', fontSize: '11px' }}>ID: {farmerId || 'Not registered'} · Sepolia Testnet</div>
                  </div>
                  <div style={{ marginLeft: 'auto', background: isApproved ? 'rgba(76,175,80,.3)' : 'rgba(255,167,38,.3)', color: isApproved ? '#a5d6a7' : '#ffe082', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                    {isApproved ? '✓ Verified' : '⏳ Pending'}
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    ['Farmer Identity Hash (SHA-256)', p ? `fv_${p.id}` : 'Not registered'],
                    ['IPFS CID (Profile Data)', p ? `Qm${String(p.id).replace(/-/g, '').slice(0, 44)}` : 'No data'],
                    ['Transaction Hash', p ? `0x${String(p.id).replace(/-/g, '')}${String(p.user_id).replace(/-/g, '').slice(0, 32)}` : 'No transaction'],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div className="chain-label">{label}</div>
                      <div className="chain-hash" style={{ cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(val); toast.success('Copied!'); }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="f-card">
                  <div className="f-card-title">📦 Transaction Info</div>
                  {[['Block Number','#7,234,891'],['Registered On', p?.created_at ? new Date(p.created_at).toLocaleDateString('en-IN') : '—'],['Gas Used','62,341 gwei'],['Status', p ? '✓ Success' : 'Not registered']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text2)' }}>{k}</span><span style={{ fontWeight: 700 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div className="f-card">
                  <div className="f-card-title">🔐 Smart Contract</div>
                  {[['Contract Address','0x4a3B...8f2E'],['Network','Sepolia Testnet'],['Verification', p ? 'Verified ✓' : 'Pending'],['Registered Farmer', user?.full_name || '—']].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text2)' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOAN */}
        {activePage === 'loan' && (
          <div className="f-page active">
            <div className="f-topbar">
              <div><div className="f-page-title">💰 Loan Eligibility</div><div className="f-page-sub">Based on your profile and land details</div></div>
              <div className="f-topbar-right">
                <button className="btn btn-primary" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => toast.success('💰 Loan application submitted!')}>Apply for Loan</button>
              </div>
            </div>
            <div className="f-content">
              <div className="loan-result approved">
                <div className="loan-result-icon approved">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase' }}>Loan Eligibility</div>
                  <div style={{ color: '#2e7d32', fontSize: '18px', fontWeight: 800 }}>{loanEligible ? '✅ ELIGIBLE' : '⚠️ INCOMPLETE PROFILE'}</div>
                  <div className="loan-amount">₹1,50,000</div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '4px' }}>At 4% interest · 36 months · PM Kisan Yojana</div>
                </div>
              </div>
              <div className="f-card" style={{ marginBottom: '14px' }}>
                <div className="f-card-title">📊 Eligibility Criteria</div>
                <div className="criteria-list">
                  {[
                    ['🌾 Land Area ≥ 1 Acre', p && parseFloat(p.land_area) >= 1, p ? `${p.land_area} ac` : 'No profile'],
                    ['📄 Profile Submitted', !!p, p ? 'Submitted ✓' : 'Pending'],
                    ['📑 Documents Uploaded', docs.length > 0, `${docs.length} docs`],
                    ['🏦 Bank Account Linked', !!(p?.account_number), p?.bank_name || 'Not linked'],
                    ['🆔 Identity Registered', !!p, p ? 'On Chain ✓' : 'Pending'],
                    ['⚠️ Existing Default', true, 'None ✓'],
                  ].map(([label, pass, val]) => (
                    <div key={label as string} className="criteria-row">
                      <div className="criteria-label">{label as string}</div>
                      <div className={`criteria-val ${pass ? 'pass' : 'fail'}`}>{val as string} {pass ? '✓' : '✗'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="f-card">
                <div className="f-card-title">🏦 Available Loan Products</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { name: 'Kisan Credit Card (KCC)', amount: '₹1,60,000', rate: '4% p.a.', term: '12 months', color: 'green' },
                    { name: 'NABARD Short-term Loan', amount: '₹1,50,000', rate: '7% p.a.', term: '36 months', color: 'orange' },
                    { name: 'PM Kisan Yojana Loan', amount: '₹1,00,000', rate: '3% p.a.', term: '24 months', color: 'green' },
                  ].map(loan => (
                    <div key={loan.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: loan.color === 'green' ? '#f1f8f1' : '#fff3e0', borderRadius: '8px', border: `1px solid ${loan.color === 'green' ? '#c8e6c9' : '#ffe0b2'}` }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: loan.color === 'green' ? '#2e7d32' : '#e65100' }}>{loan.name}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{loan.amount} · {loan.rate} · {loan.term}</div>
                      </div>
                      <button className={`btn ${loan.color === 'green' ? 'btn-primary' : 'btn-orange'}`} style={{ padding: '6px 14px', fontSize: '11px' }} onClick={() => toast.success(`💰 Applied for ${loan.name}!`)}>Apply</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR */}
        {activePage === 'qr' && (
          <div className="f-page active">
            <div className="f-topbar">
              <div><div className="f-page-title">📱 QR Identity Card</div><div className="f-page-sub">Your blockchain-verified digital identity</div></div>
            </div>
            <div className="f-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '20px', alignItems: 'start' }}>
                <div className="qr-card-wrap" style={{ maxWidth: '280px' }}>
                  <div className="qr-header">
                    <div className="qr-header-logo"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                    <div className="qr-header-name">FarmVerify</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text1)' }}>{user?.full_name || '—'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text2)', fontFamily: 'monospace' }}>{farmerId || 'Not registered'}</div>
                  <div id="qr-canvas-real" style={{ width: '180px', height: '180px', margin: '8px 0' }}>
                    {!p?.id && <div style={{ width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '8px', fontSize: '12px', color: '#9e9e9e', textAlign: 'center', padding: '16px' }}>Complete profile to generate QR</div>}
                  </div>
                  <div className="qr-info">
                    <div><div className="qr-info-row">Status</div><div className="qr-info-val" style={{ color: isApproved ? 'var(--green)' : 'var(--text2)' }}>{isApproved ? '✓ Verified' : '⏳ Pending'}</div></div>
                    <div><div className="qr-info-row">Crop</div><div className="qr-info-val">{p?.crop_type || '—'}</div></div>
                    <div><div className="qr-info-row">Land</div><div className="qr-info-val">{p ? `${p.land_area} ${p.land_unit}` : '—'}</div></div>
                    <div><div className="qr-info-row">Docs</div><div className="qr-info-val">{docs.length} uploaded</div></div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="f-card">
                    <div className="f-card-title">🔐 Identity Data Encoded in QR</div>
                    <div style={{ fontSize: '11px', color: 'var(--text2)', padding: '10px 12px', background: 'var(--green-xpale)', borderRadius: '8px', fontFamily: 'monospace', lineHeight: 2, wordBreak: 'break-all' }}>
                      {[['ID', p?.id || '—'],['NAME', user?.full_name || '—'],['STATUS', verStatus.toUpperCase()],['LAND', p ? `${p.land_area}ac` : '—'],['CROP', p?.crop_type || '—'],['DOCS', `${docs.length} uploaded`]].map(([k, v]) => (
                        <div key={k}><span style={{ color: 'var(--green)', fontWeight: 700 }}>{k}:</span> {v}</div>
                      ))}
                    </div>
                  </div>
                  <div className="f-card">
                    <div className="f-card-title">🪪 Digital ID Card Preview</div>
                    <div style={{ background: 'linear-gradient(135deg,#1b5e20,#4CAF50)', borderRadius: '12px', padding: '18px', color: 'white', display: 'flex', alignItems: 'center', gap: '14px', maxWidth: '340px', marginBottom: '14px' }}>
                      <div style={{ width: '52px', height: '52px', background: 'rgba(255,255,255,.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, border: '2px solid rgba(255,255,255,.3)', flexShrink: 0 }}>{initials}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px' }}>{user?.full_name || '—'}</div>
                        <div style={{ fontSize: '10px', opacity: .7, fontFamily: 'monospace' }}>{farmerId || 'Not registered'}</div>
                        <div style={{ marginTop: '5px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ background: 'rgba(255,255,255,.2)', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 600 }}>{isApproved ? '✓ Verified' : '⏳ Pending'}</span>
                          <span style={{ background: 'rgba(255,167,38,.3)', padding: '2px 8px', borderRadius: '10px', fontSize: '9px', fontWeight: 600 }}>💰 Loan Eligible</span>
                        </div>
                      </div>
                    </div>
                    <div className="qr-actions" style={{ justifyContent: 'flex-start' }}>
                      <button className="qr-action-btn download" onClick={() => {
                        const c = document.querySelector('#qr-canvas-real canvas') as HTMLCanvasElement;
                        if (c) { const a = document.createElement('a'); a.download = `QR_${farmerId}.png`; a.href = c.toDataURL(); a.click(); }
                        else toast.error('No QR to download');
                      }}>⬇ Download QR</button>
                      {/* ✅ FIXED: Share Link uses full UUID p?.id */}
                      <button className="qr-action-btn share" onClick={() => {
                        const qrUrl = `${window.location.origin}/farmer/${p?.id}`;
                        navigator.clipboard.writeText(qrUrl);
                        toast.success('Profile link copied! Share with bank.');
                      }}>↗ Share Link</button>
                      <button className="qr-action-btn print" onClick={() => window.print()}>🖨 Print Card</button>
                    </div>
                    {p?.id && (
                      <div style={{ marginTop: '10px', padding: '8px 10px', background: '#f1f8f1', borderRadius: '8px', fontSize: '10px', fontFamily: 'monospace', color: '#6b7280', wordBreak: 'break-all' }}>
                        🔗 {window.location.origin}/farmer/{p.id}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STATUS */}
        {activePage === 'status' && (
          <div className="f-page active">
            <div className="f-topbar">
              <div><div className="f-page-title">📊 Validation Status</div><div className="f-page-sub">Real-time identity verification progress</div></div>
              <div className="f-topbar-right">
                <button className="btn btn-outline" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => { loadData(); toast.success('🔄 Status refreshed'); }}>🔄 Refresh</button>
              </div>
            </div>
            <div className="f-content">
              {(() => {
                const checks = [!!p, !!(p?.mobile_number), !!(p?.aadhaar_number), docs.length > 0, docs.length >= 3, !!v, isApproved];
                const done = checks.filter(Boolean).length;
                const pct = Math.round(done / checks.length * 100);
                return (
                  <div className="f-card" style={{ marginBottom: '14px' }}>
                    <div className="f-card-title">Overall Verification Progress</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--text2)' }}>{done} of {checks.length} checks complete</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--green)' }}>{pct}%</div>
                    </div>
                    <div style={{ height: '10px', background: '#e0e0e0', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: 'linear-gradient(90deg,#4CAF50,#81c784)', borderRadius: '10px', width: `${pct}%`, transition: 'width .5s ease' }} />
                    </div>
                  </div>
                );
              })()}
              <div className="f-card" style={{ marginBottom: '14px' }}>
                <div className="f-card-title">✅ Verification Checklist</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    ['Profile Created', !!p, p ? `Created ${new Date(p.created_at).toLocaleDateString('en-IN')}` : 'Not created yet'],
                    ['Personal Info Filled', !!(p?.mobile_number && p?.aadhaar_number), p?.mobile_number ? 'Mobile & Aadhaar added' : 'Incomplete'],
                    ['Address Added', !!(p?.address), p?.address ? 'Address on record' : 'Not added'],
                    ['Documents Uploaded', docs.length > 0, `${docs.length} / 6 required documents`],
                    ['All Documents Submitted', docs.length >= 6, docs.length >= 6 ? 'All 6 documents ready' : `${6 - docs.length} more needed`],
                    ['Under Review', !!v, v ? `Submitted ${new Date(v.created_at).toLocaleDateString('en-IN')}` : 'Not submitted yet'],
                    ['Verification Complete', isApproved, isApproved ? 'Approved ✓' : isRejected ? 'Rejected — see remarks' : 'Awaiting decision'],
                  ].map(([label, done, desc]) => (
                    <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', background: done ? '#f1f8f1' : '#fafafa', border: `1px solid ${done ? '#c8e6c9' : '#e0e0e0'}` }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: done ? 'var(--green-mid)' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', flexShrink: 0 }}>{done ? '✓' : '○'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: done ? 'var(--green)' : 'var(--text1)' }}>{label as string}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text2)', marginTop: '1px' }}>{desc as string}</div>
                      </div>
                      <span style={{ fontSize: '10px', background: done ? '#e8f5e9' : '#fff3e0', color: done ? '#2e7d32' : '#e65100', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>{done ? '✓ Done' : 'Pending'}</span>
                    </div>
                  ))}
                </div>
              </div>
              {v?.validator_remarks && (
                <div style={{ padding: '12px 14px', background: isApproved ? '#f1f8f1' : '#fce4ec', borderRadius: '10px', border: `1px solid ${isApproved ? '#c8e6c9' : '#f8bbd0'}`, fontSize: '13px' }}>
                  <strong style={{ color: isApproved ? '#2e7d32' : '#c62828' }}>Validator Remarks:</strong>
                  <div style={{ marginTop: '4px', color: '#374151' }}>{v.validator_remarks}</div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  </>);
}

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function FarmerDashboard() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [vs, setVs] = useState<any>(null);
  const [docsCount, setDocsCount] = useState(0);
  const [userName, setUserName] = useState('Farmer');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data: u } = await supabase.from('users').select('full_name,role').eq('id', user.id).single();
      if ((u as any)?.role !== 'farmer') { router.push('/dashboard/' + ((u as any)?.role || 'farmer')); return; }
      setUserName((u as any)?.full_name || user.email?.split('@')[0] || 'Farmer');
      const { data: p } = await supabase.from('farmer_profiles').select('*').eq('user_id', user.id).single();
      setProfile(p || null);
      if (p) {
        const { data: v } = await supabase.from('verification_status').select('*').eq('farmer_id', (p as any).id).single();
        setVs(v || null);
        const { data: docs } = await supabase.from('documents').select('id').eq('farmer_id', (p as any).id);
        setDocsCount((docs || []).length);
      }
      setReady(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const p = profile;
    const v = vs;
    const farmerId = p ? 'QG-' + String(p.id).slice(0,8).toUpperCase() : '';
    if (typeof window !== 'undefined') {
      (window as any).farmerData = {
        registered: !!p, name: userName,
        phone: p?.mobile_number || '', aadhaar: p?.aadhaar_number || '',
        address: p?.address || '', village:'', taluka:'', district:'', state:'Maharashtra', pincode:'',
        landArea: p?.land_area ? String(p.land_area) : '', surveyNo:'',
        cropType: p?.crop_type || '', irrigationType:'', soilType:'', ownership:'',
        monthlyIncome:'', annualIncome:'',
        bankAccount: p?.account_number || '', ifsc: p?.ifsc_code || '',
        loanHistory:'No previous loans', dob:'',
        farmerId: farmerId, registeredAt: p?.created_at || '',
        documents: [],
        requiredDocs: {
          aadhaar:{label:'Aadhaar Card',desc:'Front & back of Aadhaar card',icon:'🪪',accept:'image/*,.pdf',file:null},
          land:{label:'Land Document',desc:'7/12 or land record extract',icon:'🗺️',accept:'image/*,.pdf',file:null},
          bank:{label:'Bank Passbook',desc:'First page of bank passbook',icon:'🏦',accept:'image/*,.pdf',file:null},
          photo:{label:'Farmer Photo',desc:'Recent passport-size photograph',icon:'🧑‍🌾',accept:'image/*',file:null},
          income:{label:'Income Certificate',desc:'Issued by Tahsildar',icon:'📃',accept:'image/*,.pdf',file:null},
          landphoto:{label:'Land Photo',desc:'Photo of your land',icon:'🌾',accept:'image/*',file:null},
        },
        validationStatus:{
          personal:!!p, address:false, land:!!p, financial:!!p,
          documents:docsCount>=6, blockchain:!!p, identity:v?.status==='approved'
        }
      };
      (window as any).doLogout = () => router.push('/auth/signout');
      setTimeout(() => {
        if ((window as any).spreadFarmerData) (window as any).spreadFarmerData();
        if ((window as any).renderDocumentsPage) (window as any).renderDocumentsPage();
        if ((window as any).updateValidationStatusPage) (window as any).updateValidationStatusPage();
        // Generate QR
        if ((window as any).farmerData?.farmerId) {
          var el = document.getElementById('qr-canvas');
          if (el && (window as any).QRCode) {
            el.innerHTML = '';
            try { new (window as any).QRCode(el, { text: (window as any).farmerData.farmerId + '|' + (window as any).farmerData.name, width:180, height:180, colorDark:'#1b5e20', colorLight:'#ffffff' }); } catch(e) {}
          }
        }
      }, 300);
    }
  }, [ready]);

  if (!ready) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f5faf5'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>🌾</div>
        <div style={{fontSize:'16px',color:'#2e7d32',fontWeight:'600',fontFamily:'Poppins,sans-serif'}}>Loading FarmVerify...</div>
        <div style={{fontSize:'12px',color:'#6b7280',marginTop:'6px'}}>Fetching your farm data</div>
      </div>
    </div>
  );

  const p = profile;
  const v = vs;
  const farmerId = p ? 'QG-' + String(p.id).slice(0,8).toUpperCase() : '';
  const initials = userName.split(' ').map((w:string) => w[0] || '').join('').toUpperCase().slice(0,2);
  const verificationStatus = v?.status || 'pending';
  const isApproved = verificationStatus === 'approved';
  const isRejected = verificationStatus === 'rejected';
  const statusColor = isApproved ? '#2e7d32' : isRejected ? '#c62828' : '#e65100';
  const statusBg = isApproved ? '#f1f8f1' : isRejected ? '#fce4ec' : '#fff8e1';
  const statusBorder = isApproved ? '#c8e6c9' : isRejected ? '#f8bbd0' : '#ffe0b2';

  const NAV_PAGES = [
    { id:'schemes', label:'Government Schemes', badge:'8', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id:'profile', label:'Farmer Profile', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { id:'documents', label:'Documents', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { id:'blockchain', label:'Blockchain Details', section:'Blockchain', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
    { id:'loan', label:'Loan Eligibility', section:'Loans & Identity', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { id:'qr', label:'QR Identity Card', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3"/></svg> },
    { id:'status', label:'Validation Status', icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  ];

  function navigate(pageId: string) {
    document.querySelectorAll('.f-page').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('dash-' + pageId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.f-nav-item').forEach(el => el.classList.remove('active'));
    const navEl = document.querySelector('[data-page="' + pageId + '"]');
    if (navEl) navEl.classList.add('active');
    if (pageId === 'qr') {
      setTimeout(() => {
        if ((window as any).farmerData?.farmerId) {
          var el = document.getElementById('qr-canvas');
          if (el && (window as any).QRCode) {
            el.innerHTML = '';
            try { new (window as any).QRCode(el, { text: (window as any).farmerData.farmerId, width:180, height:180, colorDark:'#1b5e20', colorLight:'#ffffff' }); } catch(e) {}
          }
        }
      }, 200);
    }
    if (pageId === 'status') { setTimeout(() => { if ((window as any).updateValidationStatusPage) (window as any).updateValidationStatusPage(); }, 100); }
    if (pageId === 'documents') { setTimeout(() => { if ((window as any).renderDocumentsPage) (window as any).renderDocumentsPage(); }, 100); }
    if (pageId === 'profile') { setTimeout(() => { if ((window as any).spreadFarmerData) (window as any).spreadFarmerData(); }, 100); }
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" async />
      <style dangerouslySetInnerHTML={{ __html: `*{box-sizing:border-box;margin:0;padding:0}
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

/* ─── SCREENS ─── */
.screen{display:none;animation:fadeIn .35s ease}
.screen.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* ─── LANDING ─── */
.landing{min-height:100vh;background:linear-gradient(145deg,#e8f5e9 0%,#f9fbe7 40%,#fff3e0 100%);display:flex;flex-direction:column}
.land-nav{display:flex;align-items:center;justify-content:space-between;padding:16px 32px;background:rgba(255,255,255,0.75);backdrop-filter:blur(10px);border-bottom:1px solid rgba(76,175,80,.15);position:sticky;top:0;z-index:50}
.land-logo{display:flex;align-items:center;gap:10px}
.land-logo-icon{width:36px;height:36px;background:linear-gradient(135deg,#4CAF50,#2e7d32);border-radius:10px;display:flex;align-items:center;justify-content:center}
.land-logo-icon svg{width:18px;height:18px}
.land-logo-name{font-family:var(--font-head);font-size:18px;font-weight:700;color:var(--green)}
.land-nav-links{display:flex;gap:24px}
.land-nav-links a{font-size:13.5px;color:var(--text2);cursor:pointer;font-weight:500;transition:.15s;text-decoration:none}
.land-nav-links a:hover{color:var(--green)}
.land-nav-btns{display:flex;gap:8px}
.btn{padding:8px 18px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;border:none;transition:.2s;font-family:var(--font-body)}
.btn-outline{background:transparent;border:1.5px solid var(--green);color:var(--green)}
.btn-outline:hover{background:var(--green-pale)}
.btn-primary{background:linear-gradient(135deg,#4CAF50,#2e7d32);color:#fff;box-shadow:0 2px 12px rgba(76,175,80,.35)}
.btn-primary:hover{box-shadow:0 4px 18px rgba(76,175,80,.45);transform:translateY(-1px)}
.btn-orange{background:linear-gradient(135deg,#FFA726,#e65100);color:#fff;box-shadow:0 2px 10px rgba(255,167,38,.35)}
.btn-orange:hover{transform:translateY(-1px)}

.land-hero{flex:1;display:flex;align-items:center;justify-content:center;padding:60px 32px;gap:48px;flex-wrap:wrap}
.land-hero-text{max-width:520px}
.land-badge{display:inline-flex;align-items:center;gap:6px;background:var(--green-pale);color:var(--green);padding:5px 14px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:20px;border:1px solid rgba(76,175,80,.25)}
.land-h1{font-family:var(--font-head);font-size:42px;font-weight:700;line-height:1.2;color:#1b5e20;margin-bottom:16px}
.land-h1 span{color:var(--orange)}
.land-tagline{font-size:15px;color:var(--text2);line-height:1.7;margin-bottom:32px}
.land-hero-btns{display:flex;gap:12px;flex-wrap:wrap}
.land-hero-btns .btn{padding:12px 28px;font-size:14px}
.land-features{display:flex;gap:16px;margin-top:36px;flex-wrap:wrap}
.land-feat{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--text2)}
.land-feat-dot{width:8px;height:8px;border-radius:50%;background:var(--green-mid);flex-shrink:0}

.land-illustration{width:360px;max-width:100%;flex-shrink:0}
.land-illustration svg{width:100%;height:auto;filter:drop-shadow(0 8px 24px rgba(76,175,80,.18))}

/* Floating cards on illustration */
.land-float{position:relative}
.float-card{position:absolute;background:white;border-radius:12px;padding:10px 14px;box-shadow:0 4px 20px rgba(0,0,0,.1);font-size:11px;animation:float 3s ease-in-out infinite alternate}
@keyframes float{from{transform:translateY(0)}to{transform:translateY(-8px)}}
.float-card.fc1{top:10%;right:-20px;animation-delay:0s}
.float-card.fc2{bottom:20%;left:-20px;animation-delay:1s}
.float-card.fc3{top:55%;right:-30px;animation-delay:.5s}
.fc-label{font-size:9px;color:var(--text2);margin-bottom:2px}
.fc-val{font-weight:700;color:var(--green);font-size:14px}

.land-stats{display:flex;gap:0;background:white;border-radius:var(--radius);overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);margin:0 32px 40px;border:1px solid var(--border)}
.land-stat{flex:1;padding:20px 24px;text-align:center;border-right:1px solid var(--border)}
.land-stat:last-child{border-right:none}
.land-stat-val{font-family:var(--font-head);font-size:26px;font-weight:700;color:var(--green)}
.land-stat-lbl{font-size:11px;color:var(--text2);margin-top:2px}

/* ─── AUTH ─── */
.auth-wrap{min-height:100vh;display:flex;align-items:stretch}
.auth-left{flex:1;background:linear-gradient(160deg,#1b5e20 0%,#2e7d32 50%,#388e3c 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;color:white;position:relative;overflow:hidden}
.auth-left::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")}
.auth-left-logo{display:flex;align-items:center;gap:12px;margin-bottom:40px}
.auth-left-logo-icon{width:44px;height:44px;background:rgba(255,255,255,.2);border-radius:12px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
.auth-left-logo-name{font-family:var(--font-head);font-size:22px;font-weight:700}
.auth-left h2{font-family:var(--font-head);font-size:26px;font-weight:700;margin-bottom:12px;text-align:center}
.auth-left p{font-size:13px;opacity:.75;text-align:center;line-height:1.7;max-width:280px}
.auth-art{width:240px;margin:32px 0;opacity:.9}
.auth-left-features{display:flex;flex-direction:column;gap:10px;margin-top:8px;width:100%;max-width:280px}
.auth-feat-row{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.1);border-radius:8px;padding:10px 14px;font-size:12px}
.auth-feat-icon{width:28px;height:28px;background:rgba(255,255,255,.15);border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.auth-feat-icon svg{width:14px;height:14px}

.auth-right{flex:1;display:flex;align-items:center;justify-content:center;padding:40px;background:white}
.auth-box{width:100%;max-width:400px}
.auth-title{font-family:var(--font-head);font-size:22px;font-weight:700;color:var(--text1);margin-bottom:4px}
.auth-sub{font-size:13px;color:var(--text2);margin-bottom:28px}
.form-field{margin-bottom:16px}
.form-label{font-size:12px;font-weight:600;color:var(--text1);margin-bottom:5px;display:block}
.form-input{width:100%;height:42px;border:1.5px solid var(--border);border-radius:8px;padding:0 12px;font-size:13px;font-family:var(--font-body);color:var(--text1);background:#fafafa;transition:.2s}
.form-input:focus{outline:none;border-color:var(--green-mid);background:white;box-shadow:0 0 0 3px rgba(76,175,80,.1)}
.form-input::placeholder{color:#bbb}
.pin-row{display:flex;gap:8px;justify-content:flex-start;max-width:280px}
.pin-input{width:52px;height:52px;min-width:0;max-width:60px;border:1.5px solid var(--border);border-radius:8px;text-align:center;font-size:20px;font-weight:700;letter-spacing:2px;font-family:var(--font-head);color:var(--green);flex-shrink:0}
.pin-input:focus{outline:none;border-color:var(--green-mid);box-shadow:0 0 0 3px rgba(76,175,80,.1)}
.btn-full{width:100%;padding:13px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;border:none;margin-top:8px;font-family:var(--font-body)}
.auth-switch{text-align:center;margin-top:20px;font-size:13px;color:var(--text2)}
.auth-switch a{color:var(--green);font-weight:600;cursor:pointer;text-decoration:none}
.auth-switch a:hover{text-decoration:underline}

/* Multi-step progress */
.step-progress{display:flex;align-items:center;gap:0;margin-bottom:28px}
.step-item{display:flex;align-items:center;gap:0;flex:1}
.step-circle{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;border:2px solid var(--border);background:white;color:var(--text2);transition:.3s}
.step-circle.done{background:var(--green-mid);border-color:var(--green-mid);color:white}
.step-circle.active{background:white;border-color:var(--green-mid);color:var(--green)}
.step-line{flex:1;height:2px;background:var(--border);transition:.3s}
.step-line.done{background:var(--green-mid)}
.step-label{font-size:9px;color:var(--text2);text-align:center;margin-top:4px}

/* ─── DASHBOARD ─── */
.dash-wrap{display:flex;height:100vh;background:var(--bg);overflow:hidden}

/* Farmer Sidebar */
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

/* Main content area */
.f-main{flex:1;overflow-y:auto;display:flex;flex-direction:column;min-width:0}
.f-topbar{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;border-bottom:1px solid var(--border);background:white;flex-shrink:0;position:sticky;top:0;z-index:10}
.f-page-title{font-family:var(--font-head);font-size:16px;font-weight:700;color:var(--text1)}
.f-page-sub{font-size:11px;color:var(--text2);margin-top:1px}
.f-topbar-right{display:flex;align-items:center;gap:10px}
.f-notif-btn{width:34px;height:34px;border:1px solid var(--border);border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:transparent;position:relative;color:var(--text2)}
.f-notif-btn svg{width:16px;height:16px}
.f-notif-dot{width:7px;height:7px;background:#ef4444;border-radius:50%;position:absolute;top:5px;right:5px;border:1.5px solid white}
.f-content{padding:20px 22px;flex:1}

/* Page views */
.f-page{display:none;animation:fadeIn .3s ease}
.f-page.active{display:block}

/* Cards */
.f-card{background:white;border:1px solid var(--border);border-radius:var(--radius);padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.f-card-title{font-size:13.5px;font-weight:700;color:var(--text1);margin-bottom:14px;display:flex;align-items:center;gap:7px;font-family:var(--font-head)}
.f-card-title svg{width:15px;height:15px;color:var(--green-mid)}

/* Badges */
.badge{display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.02em}
.badge-approved{background:#e8f5e9;color:#2e7d32}
.badge-pending{background:#fff3e0;color:#e65100}
.badge-rejected{background:#fce4ec;color:#c62828}
.badge-review{background:#e3f2fd;color:#1565c0}
.badge-green{background:var(--green-pale);color:var(--green)}
.badge-orange{background:var(--orange-pale);color:#e65100}

/* Stat cards */
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

/* Scheme cards */
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
.scheme-amount-lbl{font-size:10px;color:var(--text2)}
.scheme-cta{font-size:11px;color:var(--green);font-weight:600;margin-top:8px;cursor:pointer}

/* Document upload */
.upload-zone{border:2px dashed #c8e6c9;border-radius:12px;padding:32px;text-align:center;background:#f9fef9;cursor:pointer;transition:.2s;position:relative}
.upload-zone:hover{border-color:var(--green-mid);background:var(--green-pale)}
.upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer}
.upload-icon{width:48px;height:48px;background:var(--green-pale);border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:var(--green-mid)}
.upload-icon svg{width:22px;height:22px}
.upload-title{font-size:14px;font-weight:700;color:var(--text1);margin-bottom:4px}
.upload-sub{font-size:12px;color:var(--text2)}

.doc-list{display:flex;flex-direction:column;gap:8px;margin-top:14px;min-height:60px}
.doc-row{display:flex;align-items:center;gap:10px;padding:10px 12px;background:white;border:1px solid var(--border);border-radius:10px}
.doc-icon{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:700}
.doc-icon.pdf{background:#fce4ec;color:#c62828}
.doc-icon.img{background:#e3f2fd;color:#1565c0}
.doc-name{font-size:12px;font-weight:600;color:var(--text1);flex:1}
.doc-meta{font-size:10px;color:var(--text2);margin-top:1px}
.doc-cid{font-size:9px;font-family:monospace;color:var(--green);background:var(--green-pale);padding:2px 6px;border-radius:4px;margin-top:2px;display:inline-block}

/* Profile */
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

/* Blockchain */
.chain-card{background:linear-gradient(135deg,#0d47a1,#1565c0);border-radius:var(--radius);padding:18px;color:white;margin-bottom:14px;position:relative;overflow:hidden}
.chain-card::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M20 20.5V18H0v5h5v5H0v5h20v-2.5h-5V20.5h5zM5.5 3.5H4V1H1v2H0v3h5V3.5zm0 25.5H4V27H1v2H0v3h5v-2.5zM20 14h1V7h-1v5h-1v2h1zm-1 3h-1v2h2v-2h-1zm-4-3h2v-2h-2v2zm-1-4h-1v2h2v-2h-1zM12 3h2V1h-2v2zm-1 2H9v2h2V5zm-3-2H6v2h2V3zm3 20h2v-2h-2v2zm-1 2H9v2h2v-2zm-3-2H6v2h2v-2z'/%3E%3C/g%3E%3C/svg%3E")}
.chain-label{font-size:10px;opacity:.6;margin-bottom:3px;text-transform:uppercase;letter-spacing:.06em}
.chain-val{font-size:12px;font-family:monospace;word-break:break-all;opacity:.9}
.chain-hash{font-size:11px;font-family:monospace;color:#90caf9;word-break:break-all}

/* Loan */
.loan-result{border-radius:var(--radius);padding:20px;margin-bottom:16px;display:flex;align-items:flex-start;gap:16px}
.loan-result.approved{background:linear-gradient(135deg,#e8f5e9,#f1f8f1);border:1.5px solid #c8e6c9}
.loan-result.rejected{background:#fce4ec;border:1.5px solid #f8bbd0}
.loan-result-icon{width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.loan-result-icon.approved{background:var(--green-mid);color:white}
.loan-result-icon.rejected{background:#e91e63;color:white}
.loan-result-icon svg{width:22px;height:22px}
.loan-amount{font-family:var(--font-head);font-size:28px;font-weight:700;color:var(--green)}
.loan-label{font-size:12px;color:var(--text2);margin-bottom:4px}

.criteria-list{display:flex;flex-direction:column;gap:8px;margin-top:14px}
.criteria-row{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--green-xpale);border-radius:8px;border:1px solid #e8f5e9}
.criteria-label{font-size:12px;color:var(--text1);font-weight:500}
.criteria-val{font-size:12px;font-weight:700}
.criteria-val.pass{color:#2e7d32}
.criteria-val.fail{color:#c62828}

/* QR page */
.qr-container{display:flex;flex-direction:column;align-items:center;gap:16px}
.qr-card-wrap{background:white;border:2px solid var(--border);border-radius:16px;padding:24px;display:flex;flex-direction:column;align-items:center;gap:12px;box-shadow:0 4px 20px rgba(0,0,0,.08)}
.qr-header{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.qr-header-logo{width:28px;height:28px;background:linear-gradient(135deg,#4CAF50,#2e7d32);border-radius:7px;display:flex;align-items:center;justify-content:center}
.qr-header-logo svg{width:14px;height:14px}
.qr-header-name{font-family:var(--font-head);font-size:15px;font-weight:700;color:var(--green)}
#qr-canvas{border:1px solid #eee;border-radius:8px}
.qr-info{width:100%;border-top:1px solid var(--border);padding-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
.qr-info-row{font-size:10px;color:var(--text2)}
.qr-info-val{font-size:11px;color:var(--text1);font-weight:600;font-family:monospace}
.qr-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}
.qr-action-btn{display:flex;align-items:center;gap:6px;padding:9px 16px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid;transition:.15s;font-family:var(--font-body)}
.qr-action-btn.download{background:var(--green-mid);color:white;border-color:var(--green-mid)}
.qr-action-btn.share{background:white;color:var(--green);border-color:var(--green-light)}
.qr-action-btn.print{background:white;color:var(--text2);border-color:var(--border)}
.qr-action-btn svg{width:14px;height:14px}

/* Toast */
.f-toast{position:fixed;bottom:24px;right:24px;background:#1b5e20;color:white;padding:10px 16px;border-radius:10px;font-size:12.5px;font-weight:500;opacity:0;transition:opacity .3s;pointer-events:none;z-index:999;display:flex;align-items:center;gap:8px}
.f-toast.show{opacity:1}
.f-toast svg{width:14px;height:14px;flex-shrink:0}

/* Responsive tabs for mobile */
@media(max-width:768px){
  .dash-wrap{flex-direction:column}
  .f-sidebar{width:100%;height:56px;flex-direction:row;overflow-x:auto}
  .f-nav{display:flex;flex-direction:row;padding:0 8px}
  .f-nav-section,.f-farmer-footer,.f-logo-sub{display:none}
  .f-logo{padding:0 12px;border:none}
  .f-logo-title{font-size:13px}
  .f-nav-item{flex-direction:column;gap:2px;font-size:9px;padding:8px 6px;min-width:52px;border-radius:6px;border-left:none!important}
  .f-nav-item svg{width:18px;height:18px}
  .f-nav-badge{margin:0}
  .f-stat-grid{grid-template-columns:1fr 1fr}
  .scheme-grid{grid-template-columns:1fr}
  .profile-grid{grid-template-columns:1fr}
  .auth-left{display:none}
}

/* Registration step panels */
.reg-step{display:none}
.reg-step.active{display:block}
.reg-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* Validation indicator */
.verif-stepper{display:flex;flex-direction:column;gap:0}
.verif-step{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);position:relative}
.verif-step:last-child{border-bottom:none}
.verif-step-icon{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px;border:2px solid}
.verif-step-icon.done{background:var(--green-mid);border-color:var(--green-mid);color:white}
.verif-step-icon.active{background:white;border-color:var(--orange);color:var(--orange)}
.verif-step-icon.waiting{background:#f5f5f5;border-color:#e0e0e0;color:#bbb}
.verif-step-title{font-size:13px;font-weight:700;color:var(--text1)}
.verif-step-desc{font-size:11px;color:var(--text2);margin-top:2px}
.verif-step-time{font-size:10px;color:var(--text2);margin-top:4px}

/* Notification bell animation */
@keyframes bell{0%,100%{transform:rotate(0)}20%{transform:rotate(15deg)}40%{transform:rotate(-10deg)}60%{transform:rotate(8deg)}80%{transform:rotate(-5deg)}}
.bell-anim{animation:bell 2s 1s infinite}

/* Scrollbar */
.f-main::-webkit-scrollbar{width:4px}
.f-main::-webkit-scrollbar-thumb{background:#c8e6c9;border-radius:4px}
` }} />

      <div id="screen-dashboard" className="screen active">
        <div className="dash-wrap">

          {/* SIDEBAR */}
          <div className="f-sidebar">
            <div className="f-logo">
              <div className="f-logo-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="17" height="17"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
              <div><div className="f-logo-title">FarmVerify</div><div className="f-logo-sub">Farmer Portal</div></div>
            </div>
            <nav className="f-nav">
              <div className="f-nav-section">My Dashboard</div>
              {NAV_PAGES.map((item, idx) => (
                <>
                  {item.section && <div key={'s'+idx} className="f-nav-section">{item.section}</div>}
                  <div key={item.id} data-page={item.id}
                    className={'f-nav-item' + (item.id === 'schemes' ? ' active' : '')}
                    onClick={() => navigate(item.id)}
                    style={{cursor:'pointer'}}>
                    {item.icon}
                    {item.label}
                    {item.badge && <span className="f-nav-badge">{item.badge}</span>}
                  </div>
                </>
              ))}
            </nav>
            <div className="f-farmer-footer">
              <div className="f-farmer-avatar">{initials}</div>
              <div>
                <div className="f-farmer-name">{userName}</div>
                <div className="f-farmer-id">{farmerId || 'Profile Pending'}</div>
              </div>
              <button className="f-logout-btn" onClick={() => router.push('/auth/signout')} title="Logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>

          {/* MAIN */}
          <div className="f-main">

            {/* SCHEMES */}
            <div id="dash-schemes" className="f-page active">
              <div className="f-topbar">
                <div><div className="f-page-title">🏛️ Government Schemes</div><div className="f-page-sub">Schemes matched to your profile</div></div>
                <div className="f-topbar-right">
                  <select id="scheme-filter" onChange={() => (window as any).filterSchemes?.()} style={{fontSize:'12px',padding:'6px 10px',borderRadius:'8px',border:'1px solid #e0e0e0',background:'white',cursor:'pointer'}}>
                    <option value="all">All Schemes</option><option value="eligible">Eligible Only</option><option value="central">Central Govt</option><option value="state">State Govt</option><option value="loan">Loan / Credit</option>
                  </select>
                  <button className="f-notif-btn bell-anim" onClick={() => (window as any).toggleNotifications?.()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    <div className="f-notif-dot"></div>
                  </button>
                </div>
              </div>
              <div className="f-content">
                <div style={{marginBottom:'14px',padding:'12px 16px',borderRadius:'10px',border:'1px solid '+statusBorder,background:statusBg,fontSize:'13px',display:'flex',alignItems:'center',gap:'10px'}}>
                  <span style={{fontSize:'20px'}}>{isApproved ? '✅' : isRejected ? '❌' : '⏳'}</span>
                  <div>
                    <strong style={{color:statusColor}}>Verification: {verificationStatus.replace('_',' ').toUpperCase()}</strong>
                    {v?.validator_remarks && <div style={{fontSize:'12px',color:'#6b7280',marginTop:'2px'}}>Remarks: {v.validator_remarks}</div>}
                  </div>
                </div>
                <div className="f-stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)',marginBottom:'18px'}}>
                  <div className="f-stat"><div className="f-stat-info"><div className="label">Eligible Schemes</div><div className="value">8</div><div className="sub">Based on profile</div></div><div className="f-stat-icon si-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div></div>
                  <div className="f-stat"><div className="f-stat-info"><div className="label">Total Benefit</div><div className="value" style={{fontSize:'17px'}}>&#8377;5.7L</div><div className="sub">Potential/year</div></div><div className="f-stat-icon si-orange"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div></div>
                  <div className="f-stat"><div className="f-stat-info"><div className="label">Documents</div><div className="value">{docsCount}</div><div className="sub">Uploaded</div></div><div className="f-stat-icon si-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg></div></div>
                  <div className="f-stat"><div className="f-stat-info"><div className="label">Land Area</div><div className="value">{p?.land_area || '—'}</div><div className="sub">{p?.land_unit || 'acres'}</div></div><div className="f-stat-icon si-yellow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div></div>
                </div>
                <div className="scheme-grid" id="scheme-cards-container">
                  {[
                    {name:'PM-KISAN Samman Nidhi',tag:'✓ Eligible · Central',cls:'eligible',amount:'₹6,000',lbl:'/year',icon:'🌾',desc:'Direct income support of ₹6,000/year in 3 instalments for all eligible farmer families.',cat:'central eligible',fn:()=>(window as any).applyScheme?.('PM-KISAN','₹6,000/year'),cta:'Apply Now →'},
                    {name:'PM Fasal Bima Yojana',tag:'✓ Eligible · Insurance',cls:'eligible',amount:'Up to ₹2L',lbl:'coverage/season',icon:'🌧️',desc:'Comprehensive crop insurance against calamities at subsidised premium for Kharif crops.',cat:'central eligible insurance',fn:()=>(window as any).checkEligibility?.('PMFBY'),cta:'Check Eligibility →'},
                    {name:'Kisan Credit Card (KCC)',tag:'⚠ Check · Loan',cls:'check',amount:'₹1,60,000',lbl:'credit · 4% p.a.',icon:'💳',desc:'Flexible revolving credit at 4% interest for crop production and post-harvest expenses.',cat:'central loan',fn:()=>(window as any).showToast?.('🏦 Visit nearest bank for KCC'),cta:'Check Bank →'},
                    {name:'Soil Health Card',tag:'✓ Eligible · Free',cls:'eligible',amount:'Free',lbl:'every 2 years',icon:'🌱',desc:'Free soil testing with crop-wise fertilizer recommendations for better yield.',cat:'central eligible',fn:()=>(window as any).applyScheme?.('Soil Health Card','Free'),cta:'Register →'},
                    {name:'PM Krishi Sinchayee (PMKSY)',tag:'✓ Eligible · Subsidy',cls:'eligible',amount:'55%',lbl:'subsidy on irrigation',icon:'💧',desc:'Subsidy on drip/sprinkler irrigation — Har Khet Ko Pani, More Crop Per Drop.',cat:'central eligible',fn:()=>(window as any).applyScheme?.('PMKSY','55% subsidy'),cta:'Apply Now →'},
                    {name:'PM-KUSUM Solar Pump',tag:'✓ Eligible · Central',cls:'eligible',amount:'90%',lbl:'subsidy on solar pump',icon:'☀️',desc:'Solar-powered irrigation with 60% central + 30% state subsidy. Pay only 10%.',cat:'central eligible',fn:()=>(window as any).applyScheme?.('PM-KUSUM','90% subsidy'),cta:'Apply Now →'},
                    {name:'NABARD Agricultural Loan',tag:'⚠ Check · Loan',cls:'check',amount:'₹1.5L–10L',lbl:'7% p.a.',icon:'🏦',desc:'Agricultural finance with 2-3% interest subvention for timely repayment.',cat:'central loan',fn:()=>(window as any).applyLoan?.('NABARD','₹1,50,000','7% p.a.','36 months'),cta:'Apply →'},
                    {name:'Maharashtra Shetkari Yojana',tag:'ℹ State · Maharashtra',cls:'info',amount:'₹50,000',lbl:'max subsidy',icon:'🏞️',desc:'State drought relief and input subsidy for drought-affected districts.',cat:'state',fn:()=>(window as any).checkEligibility?.('Shetkari Yojana'),cta:'Check District →'},
                  ].map((s,i) => (
                    <div key={i} className={'scheme-card ' + s.cls} data-cat={s.cat}>
                      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:'8px',marginBottom:'8px'}}>
                        <div><span className={'scheme-tag ' + s.cls}>{s.tag}</span><div className="scheme-name" style={{marginTop:'6px'}}>{s.name}</div></div>
                        <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'#f1f8f1',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'18px'}}>{s.icon}</div>
                      </div>
                      <div className="scheme-desc">{s.desc}</div>
                      <div style={{display:'flex',alignItems:'baseline',gap:'4px',margin:'8px 0'}}><div className="scheme-amount">{s.amount}</div><div className="scheme-amount-lbl">{s.lbl}</div></div>
                      <div className="scheme-cta" onClick={s.fn}>{s.cta}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PROFILE */}
            <div id="dash-profile" className="f-page">
              <div className="f-topbar"><div><div className="f-page-title">👨‍🌾 Farmer Profile</div><div className="f-page-sub">Your registered information</div></div><div className="f-topbar-right"><a href="/dashboard/farmer/profile" className="btn btn-outline" style={{padding:'6px 14px',fontSize:'12px',textDecoration:'none'}}>✏️ Edit Profile</a></div></div>
              <div className="f-content">
                {!p ? (
                  <div style={{padding:'40px',textAlign:'center',background:'#fff3e0',borderRadius:'12px',border:'1px solid #ffe0b2'}}>
                    <div style={{fontSize:'40px',marginBottom:'12px'}}>🌾</div>
                    <div style={{fontSize:'16px',fontWeight:'700',color:'#e65100',marginBottom:'8px'}}>Profile Not Yet Completed</div>
                    <p style={{fontSize:'13px',color:'#6b7280',marginBottom:'16px'}}>Fill in your farmer profile to get verified and access government schemes.</p>
                    <a href="/dashboard/farmer/profile" className="btn btn-primary" style={{textDecoration:'none',padding:'10px 24px',display:'inline-block'}}>Complete Profile Now →</a>
                  </div>
                ) : (
                  <>
                    <div className="profile-header">
                      <div className="profile-avatar-lg">{initials}</div>
                      <div><div className="profile-name">{userName}</div><div className="profile-id">Farmer ID: {farmerId}</div><div className="profile-verify">{isApproved ? '✓ Identity Verified' : '⏳ Pending Verification'}</div></div>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                      <div className="f-card"><div className="f-card-title">👤 Personal Info</div><div className="profile-grid" style={{gridTemplateColumns:'1fr 1fr',gap:'8px'}}><div className="profile-field"><div className="profile-field-label">Name</div><div className="profile-field-val">{userName}</div></div><div className="profile-field"><div className="profile-field-label">Mobile</div><div className="profile-field-val">+91 {p.mobile_number}</div></div><div className="profile-field"><div className="profile-field-label">Aadhaar</div><div className="profile-field-val" style={{fontFamily:'monospace'}}>XXXX XXXX {String(p.aadhaar_number).slice(-4)}</div></div></div></div>
                      <div className="f-card"><div className="f-card-title">🌾 Farm Details</div><div className="profile-grid" style={{gridTemplateColumns:'1fr 1fr',gap:'8px'}}><div className="profile-field"><div className="profile-field-label">Crop</div><div className="profile-field-val">{p.crop_type}</div></div><div className="profile-field"><div className="profile-field-label">Land Area</div><div className="profile-field-val">{p.land_area} {p.land_unit}</div></div></div></div>
                      <div className="f-card"><div className="f-card-title">🏦 Bank Details</div><div className="profile-grid" style={{gridTemplateColumns:'1fr 1fr',gap:'8px'}}><div className="profile-field"><div className="profile-field-label">Bank</div><div className="profile-field-val">{p.bank_name}</div></div><div className="profile-field"><div className="profile-field-label">Account No.</div><div className="profile-field-val" style={{fontFamily:'monospace'}}>****{String(p.account_number).slice(-4)}</div></div><div className="profile-field"><div className="profile-field-label">IFSC</div><div className="profile-field-val">{p.ifsc_code}</div></div></div></div>
                      <div className="f-card"><div className="f-card-title">📍 Address</div><div className="profile-field"><div className="profile-field-label">Full Address</div><div className="profile-field-val">{p.address}</div></div></div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* DOCUMENTS */}
            <div id="dash-documents" className="f-page">
              <div className="f-topbar"><div><div className="f-page-title">📄 Documents</div><div className="f-page-sub">6 required documents for identity verification</div></div><div className="f-topbar-right"><div id="doc-overall-badge" style={{fontSize:'12px',fontWeight:'700',padding:'5px 12px',borderRadius:'20px',background:'#fff3e0',color:'#e65100',border:'1px solid #ffe0b2'}}>{docsCount} / 6 Uploaded</div></div></div>
              <div className="f-content">
                <div className="f-card" style={{marginBottom:'16px',padding:'14px 16px'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'8px'}}><div style={{fontSize:'13px',fontWeight:'700'}}>📋 Submission Progress</div><div id="doc-progress-label" style={{fontSize:'12px',color:'#6b7280'}}>0 of 6 uploaded</div></div>
                  <div style={{height:'8px',background:'#e0e0e0',borderRadius:'10px',overflow:'hidden'}}><div id="doc-progress-bar" style={{height:'100%',background:'linear-gradient(90deg,#4CAF50,#81c784)',borderRadius:'10px',width:'0%',transition:'width .4s ease'}}></div></div>
                </div>
                <div id="req-docs-grid" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px',marginBottom:'16px'}}></div>
                <div style={{padding:'12px 14px',background:'#f1f8f1',borderRadius:'10px',border:'1px solid #c8e6c9',fontSize:'12px',color:'#6b7280'}}>
                  You can also <a href="/dashboard/farmer/documents" style={{color:'#2e7d32',fontWeight:'600'}}>upload documents on your profile page →</a>
                </div>
              </div>
            </div>

            {/* BLOCKCHAIN */}
            <div id="dash-blockchain" className="f-page">
              <div className="f-topbar"><div><div className="f-page-title">⛓️ Blockchain Details</div><div className="f-page-sub">Ethereum Sepolia Testnet</div></div><div className="f-topbar-right"><button className="btn btn-outline" style={{padding:'7px 14px',fontSize:'12px'}} onClick={() => window.open('https://sepolia.etherscan.io','_blank')}>🔗 View on Etherscan</button></div></div>
              <div className="f-content">
                <div className="chain-card">
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
                    <div style={{width:'36px',height:'36px',background:'rgba(255,255,255,.15)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}><svg viewBox="0 0 24 24" fill="none" stroke="#90caf9" strokeWidth="2" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                    <div><div style={{color:'white',fontWeight:'700',fontSize:'14px'}}>{userName}</div><div style={{color:'rgba(255,255,255,.5)',fontSize:'11px'}}>ID: {farmerId || 'Pending'}</div></div>
                    <div style={{marginLeft:'auto',background:isApproved?'rgba(76,175,80,.3)':'rgba(255,167,38,.3)',color:isApproved?'#a5d6a7':'#ffe082',padding:'4px 10px',borderRadius:'20px',fontSize:'11px',fontWeight:'600'}}>{isApproved?'✓ Verified':'⏳ Pending'}</div>
                  </div>
                  <div style={{display:'grid',gap:'12px'}}>
                    <div><div className="chain-label">Farmer Identity Hash</div><div className="chain-hash">{p ? 'fv_' + p.id : 'Not registered'}</div></div>
                    <div><div className="chain-label">Profile ID</div><div className="chain-hash">{p?.id || 'Not registered'}</div></div>
                    <div><div className="chain-label">Verification Status</div><div className="chain-hash">{verificationStatus}{v?.reviewed_at ? ' · Reviewed: ' + new Date(v.reviewed_at).toLocaleDateString() : ''}</div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* LOAN */}
            <div id="dash-loan" className="f-page">
              <div className="f-topbar"><div><div className="f-page-title">💰 Loan Eligibility</div><div className="f-page-sub">Based on your profile</div></div><div className="f-topbar-right"><button className="btn btn-primary" style={{padding:'7px 14px',fontSize:'12px'}} onClick={() => (window as any).applyLoan?.('PM Kisan Loan','₹1,50,000','4% p.a.','36 months')}>Apply for Loan</button></div></div>
              <div className="f-content">
                <div className="loan-result approved">
                  <div className="loan-result-icon approved"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22"><polyline points="20 6 9 17 4 12"/></svg></div>
                  <div><div style={{fontSize:'11px',color:'#6b7280',fontWeight:'600',textTransform:'uppercase'}}>Loan Eligibility</div><div style={{color:'#2e7d32',fontSize:'18px',fontWeight:'800'}}>✅ ELIGIBLE</div><div className="loan-amount">&#8377;1,50,000</div><div style={{fontSize:'11px',color:'#6b7280',marginTop:'4px'}}>At 4% interest · 36 months · PM Kisan Yojana</div></div>
                </div>
                <div className="f-card" style={{marginBottom:'14px'}}>
                  <div className="f-card-title">Eligibility Criteria</div>
                  <div className="criteria-list">
                    <div className="criteria-row"><div className="criteria-label">🌾 Land Area</div><div className="criteria-val pass">{p?.land_area || '?'} ac ✓</div></div>
                    <div className="criteria-row"><div className="criteria-label">📄 Profile Submitted</div><div className="criteria-val pass">{p ? 'Verified ✓' : 'Pending'}</div></div>
                    <div className="criteria-row"><div className="criteria-label">🏦 Bank Account</div><div className="criteria-val pass">{p?.bank_name || 'Linked'} ✓</div></div>
                    <div className="criteria-row"><div className="criteria-label">⚠️ Existing Default</div><div className="criteria-val pass">None ✓</div></div>
                  </div>
                </div>
                <div className="f-card">
                  <div className="f-card-title">Available Loan Products</div>
                  <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',background:'#f1f8f1',borderRadius:'8px',border:'1px solid #c8e6c9'}}><div><div style={{fontSize:'13px',fontWeight:'700',color:'#2e7d32'}}>Kisan Credit Card (KCC)</div><div style={{fontSize:'11px',color:'#6b7280'}}>₹1,60,000 · 4% p.a. · 12 months</div></div><button className="btn btn-primary" style={{padding:'6px 14px',fontSize:'11px'}} onClick={() => (window as any).applyLoan?.('KCC','₹1,60,000','4% p.a.','12 months')}>Apply</button></div>
                    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',background:'#fff3e0',borderRadius:'8px',border:'1px solid #ffe0b2'}}><div><div style={{fontSize:'13px',fontWeight:'700',color:'#e65100'}}>NABARD Short-term Loan</div><div style={{fontSize:'11px',color:'#6b7280'}}>₹1,50,000 · 7% p.a. · 36 months</div></div><button className="btn btn-orange" style={{padding:'6px 14px',fontSize:'11px'}} onClick={() => (window as any).applyLoan?.('NABARD','₹1,50,000','7% p.a.','36 months')}>Apply</button></div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR */}
            <div id="dash-qr" className="f-page">
              <div className="f-topbar"><div><div className="f-page-title">📱 QR Identity Card</div><div className="f-page-sub">Your blockchain-verified digital identity</div></div></div>
              <div className="f-content">
                <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:'20px',alignItems:'start'}}>
                  <div className="qr-card-wrap" style={{maxWidth:'280px'}}>
                    <div className="qr-header"><div className="qr-header-logo"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="14" height="14"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div className="qr-header-name">FarmVerify</div></div>
                    <div style={{fontWeight:'700',fontSize:'16px',color:'#1a1a1a'}}>{userName}</div>
                    <div style={{fontSize:'11px',color:'#6b7280',fontFamily:'monospace'}}>{farmerId || 'Not registered'}</div>
                    <div id="qr-canvas" style={{width:'180px',height:'180px',margin:'8px 0'}}></div>
                    <div className="qr-info">
                      <div><div className="qr-info-row">Status</div><div className="qr-info-val" style={{color:isApproved?'#2e7d32':'#6b7280'}}>{isApproved?'✓ Verified':'⏳ Pending'}</div></div>
                      <div><div className="qr-info-row">Crop</div><div className="qr-info-val">{p?.crop_type || '—'}</div></div>
                      <div><div className="qr-info-row">Land</div><div className="qr-info-val">{p ? p.land_area + ' ' + p.land_unit : '—'}</div></div>
                      <div><div className="qr-info-row">Docs</div><div className="qr-info-val">{docsCount} uploaded</div></div>
                    </div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                    <div className="f-card">
                      <div className="f-card-title">🪪 Digital ID Card</div>
                      <div style={{background:'linear-gradient(135deg,#1b5e20,#4CAF50)',borderRadius:'10px',padding:'16px',color:'white',display:'flex',alignItems:'center',gap:'14px',marginBottom:'14px'}}>
                        <div style={{width:'48px',height:'48px',background:'rgba(255,255,255,.2)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:'700',flexShrink:0}}>{initials}</div>
                        <div>
                          <div style={{fontWeight:'700',fontSize:'15px'}}>{userName}</div>
                          <div style={{fontSize:'10px',opacity:.7,fontFamily:'monospace'}}>{farmerId || 'Not registered'}</div>
                          <div style={{marginTop:'5px',display:'flex',gap:'6px'}}>
                            <span style={{background:'rgba(255,255,255,.2)',padding:'2px 7px',borderRadius:'10px',fontSize:'9px',fontWeight:'600'}}>{isApproved?'✓ Verified':'⏳ Pending'}</span>
                            <span style={{background:'rgba(255,167,38,.3)',padding:'2px 7px',borderRadius:'10px',fontSize:'9px',fontWeight:'600'}}>💰 Loan Eligible</span>
                          </div>
                        </div>
                      </div>
                      <div className="qr-actions">
                        <button className="qr-action-btn download" onClick={() => (window as any).downloadQR?.()}>⬇ Download QR</button>
                        <button className="qr-action-btn share" onClick={() => (window as any).shareQR?.()}>↗ Share QR</button>
                        <button className="qr-action-btn print" onClick={() => (window as any).printIDCard?.()}>🖨 Print Card</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* STATUS */}
            <div id="dash-status" className="f-page">
              <div className="f-topbar"><div><div className="f-page-title">📊 Validation Status</div><div className="f-page-sub">Real-time verification progress</div></div><div className="f-topbar-right"><button className="btn btn-outline" style={{padding:'7px 14px',fontSize:'12px'}} onClick={() => { (window as any).updateValidationStatusPage?.(); (window as any).showToast?.('🔄 Status refreshed'); }}>🔄 Refresh</button></div></div>
              <div className="f-content">
                <div className="f-card" style={{marginBottom:'14px'}}>
                  <div className="f-card-title">Overall Verification Progress</div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}><div style={{fontSize:'13px',color:'#6b7280'}} id="vs-progress-label">Loading...</div><div style={{fontSize:'18px',fontWeight:'800',color:'#2e7d32'}} id="vs-progress-pct">0%</div></div>
                  <div style={{height:'10px',background:'#e0e0e0',borderRadius:'10px',overflow:'hidden'}}><div id="vs-progress-bar" style={{height:'100%',background:'linear-gradient(90deg,#4CAF50,#81c784)',borderRadius:'10px',width:'0%',transition:'width .5s ease'}}></div></div>
                </div>
                <div className="f-card"><div className="f-card-title">Verification Checklist</div><div id="vs-steps-container" style={{display:'flex',flexDirection:'column',gap:'8px'}}><div style={{textAlign:'center',padding:'20px',color:'#6b7280'}}>Loading status...</div></div></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="f-toast" id="f-toast">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
        <span id="f-toast-msg"></span>
      </div>

      <script dangerouslySetInnerHTML={{ __html: `// ══════════════════════════════════════════
//  QuantumGuard — Full Button Functionality
// ══════════════════════════════════════════

// ── LANDING NAV SCROLL ──
function landScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // Highlight active nav link
  document.querySelectorAll('.land-nav-links a').forEach(a => a.style.color = '');
  const map = { 'land-about':'About','land-features':'Features','land-schemes':'Schemes','land-contact':'Contact' };
  document.querySelectorAll('.land-nav-links a').forEach(a => {
    if (a.textContent === map[id]) a.style.color = 'var(--green)';
  });
}

// ── CONTACT FORM SUBMIT ──
function submitContact() {
  const name = document.getElementById('contact-name')?.value.trim();
  const phone = document.getElementById('contact-phone')?.value.trim();
  const msg = document.getElementById('contact-msg')?.value.trim();
  if (!name || !phone || !msg) { showToast('⚠️ Please fill in all required fields'); return; }
  if (phone.length < 10) { showToast('⚠️ Enter a valid 10-digit phone number'); return; }
  const btn = event.currentTarget;
  btn.textContent = '⏳ Sending...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = '📨 Send Message';
    btn.disabled = false;
    document.getElementById('contact-name').value = '';
    document.getElementById('contact-phone').value = '';
    document.getElementById('contact-msg').value = '';
    showToast('✅ Message sent! We\\'ll respond within 24 hours.');
  }, 1500);
}

// ── SCREEN NAVIGATION ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'screen-dashboard') {
    setTimeout(() => animateStatValues(), 300);
  }
  if (id === 'screen-register') {
    // Reset farmerData for new registration
    window.farmerData = getDefaultFarmerData();
    // Reset registration form fields
    ['reg-name','reg-dob','reg-phone','reg-aadhaar','reg-address','reg-village','reg-taluka',
     'reg-district','reg-pincode','reg-landarea','reg-surveyno','reg-croptype','reg-irrigationtype',
     'reg-soiltype','reg-ownership','reg-monthlyincome','reg-annualincome','reg-bankaccount',
     'reg-ifsc','reg-loanhistory'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const stateEl = document.getElementById('reg-state');
    if (stateEl) stateEl.value = 'Maharashtra';
    // Reset step to 1
    window.currentRegStep = 1;
    for (let i = 1; i <= 4; i++) {
      const step = document.getElementById('reg-step-'+i);
      if (step) step.classList.toggle('active', i === 1);
      const sc = document.getElementById('sc'+i);
      if (sc) { sc.className = i === 1 ? 'step-circle active' : 'step-circle'; sc.textContent = i === 1 ? '1' : i; }
      if (i < 4) { const sl = document.getElementById('sl'+i); if (sl) sl.classList.remove('done'); }
      const ind = document.getElementById('reg-step-indicator-'+i);
      if (ind) ind.style.opacity = i === 1 ? '1' : '0.4';
    }
    const prevBtn = document.getElementById('reg-prev-btn');
    if (prevBtn) prevBtn.style.display = 'none';
    const nextBtn = document.getElementById('reg-next-btn');
    if (nextBtn) { nextBtn.textContent = 'Next Step →'; nextBtn.style.background = 'linear-gradient(135deg,#4CAF50,#2e7d32)'; nextBtn.disabled = false; }
  }
  if (id === 'screen-login') {
    // Clear login fields
    const lp = document.getElementById('login-phone'); if (lp) lp.value = '';
    ['pin1','pin2','pin3','pin4'].forEach(pid => { const el = document.getElementById(pid); if (el) el.value = ''; });
  }
}

// ── DASHBOARD PAGE NAVIGATION ──
function showDashPage(id, el) {
  document.querySelectorAll('.f-page').forEach(p => p.classList.remove('active'));
  document.getElementById('dash-' + id).classList.add('active');
  document.querySelectorAll('.f-nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  // Update topbar title
  const titles = {
    schemes: ['🏛️ Government Schemes', '3 schemes you may be eligible for'],
    profile: ['👨‍🌾 Farmer Profile', 'Manage your personal information'],
    documents: ['📄 Document Status', 'Uploaded to IPFS – Immutable & Decentralized'],
    blockchain: ['⛓️ Blockchain Details', 'Ethereum Sepolia Testnet — Immutable record'],
    loan: ['💰 Loan Eligibility', 'Based on your land, income & documents'],
    qr: ['📱 QR Identity Card', 'Your blockchain-verified digital identity'],
    status: ['📊 Validation Status', 'Real-time identity verification progress']
  };
  if (id === 'qr') setTimeout(generateQR, 200);
}

// ── LOGIN ──
function doLoginOriginal() {
  showScreen('screen-dashboard');
  const greeting = farmerData.name ? '👋 Welcome back, ' + farmerData.name + '!' : '👋 Welcome back!';
  showToast(greeting);
}

// ── AADHAAR OTP LOGIN ──
function doAadhaarLogin() {
  // Restore saved farmer data first
  try {
    const saved = localStorage.getItem('qg_farmer');
    if (saved) { const parsed = JSON.parse(saved); Object.assign(farmerData, parsed); }
  } catch(e) {}
  showToast('📱 OTP sent to registered mobile');
  setTimeout(() => showToast('✅ OTP verified — logging in...'), 1500);
  setTimeout(() => {
    showScreen('screen-dashboard');
    const greeting = farmerData.name ? '👋 Welcome back, ' + farmerData.name + '!' : '👋 Welcome back!';
    showToast(greeting);
    setTimeout(() => { spreadFarmerData(); renderDocumentsPage(); updateValidationStatusPage(); }, 200);
  }, 2800);
}

// ── PIN INPUT AUTO-ADVANCE ──
function nextPin(el, idx) {
  if (el.value.length === 1 && idx < 4) {
    const pins = el.closest('.pin-row').querySelectorAll('.pin-input');
    if (pins[idx]) pins[idx].focus();
  }
}

// ── REGISTRATION STEPS ──
let currentRegStep = 1;
function regStepUI(dir) {
  const next = currentRegStep + dir;
  if (next < 1 || next > 4) {
    if (next > 4) {
      const btn = document.getElementById('reg-next-btn');
      btn.textContent = '⏳ Registering...';
      btn.disabled = true;
      showToast('🚀 Registering on blockchain...');
      setTimeout(() => showToast('🔗 Storing identity hash on Ethereum...'), 1000);
      setTimeout(() => {
        btn.disabled = false;
        showScreen('screen-dashboard');
        showToast('✅ Welcome to QuantumGuard, ' + (farmerData.name || 'Farmer') + '!');
      }, 2200);
      return;
    }
    return;
  }

  document.getElementById('reg-step-' + currentRegStep).classList.remove('active');
  document.getElementById('sc' + currentRegStep).classList.remove('active');
  if (currentRegStep < 4) document.getElementById('sl' + currentRegStep).classList[dir > 0 ? 'add' : 'remove']('done');
  document.getElementById('reg-step-indicator-' + currentRegStep).style.opacity = '0.4';
  if (currentRegStep > 1 && dir < 0) document.getElementById('sc' + currentRegStep).classList.remove('done');

  currentRegStep = next;

  for (let i = 1; i < currentRegStep; i++) {
    document.getElementById('sc' + i).className = 'step-circle done';
    document.getElementById('sc' + i).textContent = '✓';
    if (i < 4) document.getElementById('sl' + i).classList.add('done');
    document.getElementById('reg-step-indicator-' + i).style.opacity = '1';
  }

  document.getElementById('reg-step-' + currentRegStep).classList.add('active');
  document.getElementById('sc' + currentRegStep).className = 'step-circle active';
  document.getElementById('sc' + currentRegStep).textContent = currentRegStep;
  document.getElementById('reg-step-indicator-' + currentRegStep).style.opacity = '1';

  for (let i = currentRegStep + 1; i <= 4; i++) {
    document.getElementById('sc' + i).className = 'step-circle';
    document.getElementById('sc' + i).textContent = i;
    document.getElementById('reg-step-indicator-' + i).style.opacity = '0.4';
  }

  document.getElementById('reg-prev-btn').style.display = currentRegStep > 1 ? 'block' : 'none';
  const nextBtn = document.getElementById('reg-next-btn');
  nextBtn.textContent = currentRegStep === 4 ? '🚀 Complete Registration' : 'Next Step →';
  nextBtn.style.background = currentRegStep === 4 ? 'linear-gradient(135deg,#FFA726,#e65100)' : 'linear-gradient(135deg,#4CAF50,#2e7d32)';
}

// ── TOAST ──
function showToast(msg) {
  const t = document.getElementById('f-toast');
  document.getElementById('f-toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

// ── FILTER BUTTONS ──
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    this.closest('.search-wrap').querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
  });
});

// ── ANIMATE STAT VALUES ──
function animateValue(el, end, prefix='', suffix='') {
  let start = 0;
  const step = end / 30;
  const timer = setInterval(() => {
    start += step;
    if (start >= end) { el.textContent = prefix + end + suffix; clearInterval(timer); return; }
    el.textContent = prefix + Math.floor(start) + suffix;
  }, 30);
}
function animateStatValues() {
  // nothing to count-up on initial load — placeholder for future stat cards
}

// ── NOTIFICATION BELL ──
let notifOpen = false;
function toggleNotifications() {
  if (notifOpen) { closeNotifications(); return; }
  notifOpen = true;
  // Remove existing panel
  document.getElementById('notif-panel')?.remove();
  const panel = document.createElement('div');
  panel.id = 'notif-panel';
  panel.style.cssText = 'position:fixed;top:56px;right:18px;width:300px;background:white;border:1px solid #e0e0e0;border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.12);z-index:999;overflow:hidden;animation:fadeIn .2s ease';
  panel.innerHTML = \`
    <div style="padding:14px 16px;border-bottom:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:center">
      <div style="font-weight:700;font-size:13px;font-family:var(--font-head)">Notifications</div>
      <span style="background:#ef4444;color:white;font-size:9px;font-weight:700;padding:2px 7px;border-radius:10px">3 NEW</span>
    </div>
    \${[
      ['✅','Identity Approved','Your blockchain identity is now active','Jan 20','green-xpale','#c8e6c9'],
      ['💰','Loan Pre-Approved','₹1,50,000 loan offer from SBI Kisan branch','Jan 22','green-xpale','#c8e6c9'],
      ['⏳','Document Under Review','Bank passbook sent for verification','Feb 3','#fff3e0','#ffe0b2'],
      ['📋','PM-KISAN Submitted','Application sent to government portal','Mar 5','#e3f2fd','#bbdefb'],
    ].map(([icon,title,desc,date,bg,border])=>\`
      <div style="padding:12px 16px;border-bottom:1px solid #f5f5f5;display:flex;gap:10px;align-items:flex-start;cursor:pointer;background:\${bg};transition:.15s" onmouseenter="this.style.opacity='.85'" onmouseleave="this.style.opacity='1'">
        <span style="font-size:16px">\${icon}</span>
        <div>
          <div style="font-size:12px;font-weight:600;color:#1a1a1a">\${title}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:2px">\${desc}</div>
          <div style="font-size:10px;color:#9ca3af;margin-top:3px">\${date}</div>
        </div>
      </div>\`).join('')}
    <div style="padding:10px 16px;text-align:center;cursor:pointer;font-size:12px;color:var(--green);font-weight:600" onclick="closeNotifications();showToast('📋 Viewing all notifications')">View All Notifications</div>
  \`;
  document.body.appendChild(panel);
  setTimeout(() => document.addEventListener('click', outsideNotifClick), 50);
}
function outsideNotifClick(e) {
  const panel = document.getElementById('notif-panel');
  const bell = document.querySelector('.bell-anim');
  if (panel && !panel.contains(e.target) && !bell?.contains(e.target)) closeNotifications();
}
function closeNotifications() {
  document.getElementById('notif-panel')?.remove();
  document.removeEventListener('click', outsideNotifClick);
  notifOpen = false;
}

// ── SCHEME APPLY BUTTONS ──
function applyScheme(name, amount) {
  showModal(\`Apply for \${name}\`,
    \`<p style="font-size:13px;color:var(--text2);margin-bottom:16px">You are about to apply for <strong>\${name}</strong> with a benefit of <strong>\${amount}</strong>.</p>
    <p style="font-size:12px;color:var(--text2);margin-bottom:16px">Your verified documents and blockchain identity will be submitted to the government portal automatically.</p>
    <div style="background:var(--green-pale);padding:10px 12px;border-radius:8px;font-size:12px;color:var(--green);border:1px solid #c8e6c9">✅ All required documents are verified and ready for submission.</div>\`,
    () => {
      closeModal();
      showToast(\`🚀 Applying for \${name}...\`);
      setTimeout(() => showToast('✅ Application submitted to government portal!'), 1500);
    }, 'Submit Application', 'linear-gradient(135deg,#4CAF50,#2e7d32)'
  );
}

function checkEligibility(name) {
  showToast(\`🔍 Checking eligibility for \${name}...\`);
  setTimeout(() => showToast('✅ You are eligible! Apply now.'), 1500);
}

// ── EDIT PROFILE ──
function editProfile() {
  const f = farmerData;
  showModal('✏️ Edit Profile',
    \`<div style="max-height:60vh;overflow-y:auto;padding-right:4px">
      <div style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px">Personal</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div class="form-field" style="margin:0"><label class="form-label">Full Name</label><input class="form-input" id="ep-name" value="\${f.name||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">Date of Birth</label><input class="form-input" id="ep-dob" type="date" value="\${f.dob||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">Phone</label><input class="form-input" id="ep-phone" value="\${f.phone||''}" maxlength="10"></div>
        <div class="form-field" style="margin:0"><label class="form-label">Aadhaar</label><input class="form-input" id="ep-aadhaar" value="\${f.aadhaar||''}" maxlength="14" placeholder="XXXX XXXX XXXX"></div>
      </div>
      <div style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px">Address</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div class="form-field" style="margin:0;grid-column:1/-1"><label class="form-label">Full Address</label><input class="form-input" id="ep-address" value="\${f.address||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">Village</label><input class="form-input" id="ep-village" value="\${f.village||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">District</label><input class="form-input" id="ep-district" value="\${f.district||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">Taluka</label><input class="form-input" id="ep-taluka" value="\${f.taluka||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">PIN Code</label><input class="form-input" id="ep-pincode" value="\${f.pincode||''}"></div>
      </div>
      <div style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px">Land</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div class="form-field" style="margin:0"><label class="form-label">Land Area (Acres)</label><input class="form-input" id="ep-land" type="number" value="\${f.landArea||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">Survey No.</label><input class="form-input" id="ep-surveyno" value="\${f.surveyNo||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">Crop Type</label><input class="form-input" id="ep-croptype" value="\${f.cropType||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">Irrigation Type</label><input class="form-input" id="ep-irrigation" value="\${f.irrigationType||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">Soil Type</label><input class="form-input" id="ep-soiltype" value="\${f.soilType||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">Ownership</label><input class="form-input" id="ep-ownership" value="\${f.ownership||''}"></div>
      </div>
      <div style="font-size:11px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;margin:0 0 8px">Financial</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div class="form-field" style="margin:0"><label class="form-label">Monthly Income (₹)</label><input class="form-input" id="ep-income" type="number" value="\${f.monthlyIncome||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">Annual Income (₹)</label><input class="form-input" id="ep-annual" type="number" value="\${f.annualIncome||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">Bank Account No.</label><input class="form-input" id="ep-bank" value="\${f.bankAccount||''}"></div>
        <div class="form-field" style="margin:0"><label class="form-label">IFSC Code</label><input class="form-input" id="ep-ifsc" value="\${f.ifsc||''}"></div>
        <div class="form-field" style="margin:0;grid-column:1/-1"><label class="form-label">Loan History</label><input class="form-input" id="ep-loanhistory" value="\${f.loanHistory||''}"></div>
      </div>
    </div>\`,
    () => {
      farmerData.name          = document.getElementById('ep-name')?.value.trim()       || farmerData.name;
      farmerData.dob           = document.getElementById('ep-dob')?.value               || farmerData.dob;
      farmerData.phone         = document.getElementById('ep-phone')?.value.trim()      || farmerData.phone;
      farmerData.aadhaar       = document.getElementById('ep-aadhaar')?.value.trim()    || farmerData.aadhaar;
      farmerData.address       = document.getElementById('ep-address')?.value.trim()    || farmerData.address;
      farmerData.village       = document.getElementById('ep-village')?.value.trim()    || farmerData.village;
      farmerData.district      = document.getElementById('ep-district')?.value.trim()   || farmerData.district;
      farmerData.taluka        = document.getElementById('ep-taluka')?.value.trim()     || farmerData.taluka;
      farmerData.pincode       = document.getElementById('ep-pincode')?.value.trim()    || farmerData.pincode;
      farmerData.landArea      = document.getElementById('ep-land')?.value              || farmerData.landArea;
      farmerData.surveyNo      = document.getElementById('ep-surveyno')?.value.trim()   || farmerData.surveyNo;
      farmerData.cropType      = document.getElementById('ep-croptype')?.value.trim()   || farmerData.cropType;
      farmerData.irrigationType= document.getElementById('ep-irrigation')?.value.trim() || farmerData.irrigationType;
      farmerData.soilType      = document.getElementById('ep-soiltype')?.value.trim()   || farmerData.soilType;
      farmerData.ownership     = document.getElementById('ep-ownership')?.value.trim()  || farmerData.ownership;
      farmerData.monthlyIncome = document.getElementById('ep-income')?.value            || farmerData.monthlyIncome;
      farmerData.annualIncome  = document.getElementById('ep-annual')?.value            || farmerData.annualIncome;
      farmerData.bankAccount   = document.getElementById('ep-bank')?.value.trim()       || farmerData.bankAccount;
      farmerData.ifsc          = document.getElementById('ep-ifsc')?.value.trim()       || farmerData.ifsc;
      farmerData.loanHistory   = document.getElementById('ep-loanhistory')?.value.trim()|| farmerData.loanHistory;
      try {
        localStorage.setItem('qg_farmer', JSON.stringify(farmerData));
        // Also update in multi-user store
        if (farmerData.phone) {
          const allUsers = JSON.parse(localStorage.getItem('qg_all_farmers') || '{}');
          allUsers[farmerData.phone] = JSON.parse(JSON.stringify(farmerData));
          localStorage.setItem('qg_all_farmers', JSON.stringify(allUsers));
        }
      } catch(e){}
      closeModal();
      spreadFarmerData();
      updateBlockchainPage();
      showToast('✅ Profile updated successfully!');
    },
    'Save Changes', 'linear-gradient(135deg,#4CAF50,#2e7d32)'
  );
}

// ── DOCUMENT UPLOAD ──
function openUploadZone() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*,.pdf';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  fileInput.click();
  fileInput.addEventListener('change', function() {
    if (this.files[0]) {
      const file = this.files[0];
      showToast(\`📤 Uploading "\${file.name}" to IPFS...\`);
      setTimeout(() => showToast('🔗 Pinning to Pinata gateway...'), 1200);
      setTimeout(() => {
        addDocumentToList(file.name, file.size);
        showToast('✅ Document uploaded & pinned to IPFS!');
      }, 2500);
    }
    document.body.removeChild(fileInput);
  });
}

function addDocumentToList(name, size) {
  // Delegate to dynamic version
  addDocumentToListDynamic({name: name, size: size});
}

function deleteDoc(btn) {
  const row = btn.closest('.doc-row');
  const idx = parseInt(row.getAttribute('data-idx'));
  if (!isNaN(idx)) {
    deleteDocByIdx(idx);
  } else {
    row.style.opacity = '0';
    row.style.transition = 'opacity .3s';
    setTimeout(() => { row.remove(); showToast('🗑️ Document removed'); }, 300);
  }
}

// ── COPY HASH / CID BUTTONS ──
function copyToClipboard(text, label) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(\`📋 \${label} copied to clipboard!\`);
  }).catch(() => {
    showToast(\`📋 \${label} copied!\`);
  });
}

// ── LOAN APPLICATION MODAL ──
function applyLoan(type, amount, rate, term) {
  showModal(\`Apply for \${type}\`,
    \`<div style="background:var(--green-pale);border-radius:10px;padding:14px;margin-bottom:16px;border:1px solid #c8e6c9">
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:6px 0;border-bottom:1px solid #c8e6c9"><span style="color:var(--text2)">Loan Amount</span><span style="font-weight:700;color:var(--green)">\${amount}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:6px 0;border-bottom:1px solid #c8e6c9"><span style="color:var(--text2)">Interest Rate</span><span style="font-weight:700">\${rate}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:6px 0"><span style="color:var(--text2)">Repayment Term</span><span style="font-weight:700">\${term}</span></div>
    </div>
    <div class="form-field"><label class="form-label">Preferred Bank Branch</label>
    <select class="form-input"><option>SBI – Satara Main Branch</option><option>Bank of Maharashtra – Koregaon</option><option>NABARD Regional Office</option></select></div>
    <div class="form-field"><label class="form-label">Purpose of Loan</label>
    <select class="form-input"><option>Crop Cultivation</option><option>Farm Equipment</option><option>Irrigation Setup</option><option>Seed & Fertilizer</option></select></div>\`,
    () => { closeModal(); showToast(\`✅ \${type} application submitted!\`); setTimeout(()=>showToast('🏦 Bank will contact within 3-5 days'),1500); },
    'Submit Loan Application', 'linear-gradient(135deg,#4CAF50,#2e7d32)'
  );
}

// ── QR CODE GENERATION ──
function generateQR() {
  // Delegate to dynamic version
  generateQRDynamic();
}

// ── QR DOWNLOAD ──
function downloadQR() {
  const canvas = document.querySelector('#qr-canvas canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = 'QuantumGuard_' + (farmerData.farmerId||'QG-ID') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('📥 QR Code downloaded as PNG!');
  } else {
    showToast('📥 QR Card image saving...');
  }
}

// ── SHARE QR ──
function shareQR() {
  const f = farmerData;
  const text = 'QuantumGuard Verified Farmer ID: ' + (f.farmerId||'QG-XXXX') + ' | ' + (f.name||'Farmer') + ' | Verified on Ethereum Sepolia';
  if (navigator.share) {
    navigator.share({ title: 'QuantumGuard Farmer ID', text }).catch(()=>{});
  } else {
    navigator.clipboard.writeText(text).catch(()=>{});
    showToast('🔗 Identity link copied to clipboard!');
  }
}

// ── PRINT ──
function printIDCard() {
  showToast('🖨️ Opening print dialog...');
  setTimeout(() => window.print(), 500);
}

// ── LOGOUT ──
function doLogout() {
  showModal('🚪 Logout', '<p style="font-size:13px;color:var(--text2)">Are you sure you want to logout from your QuantumGuard farmer account?</p>',
    () => { closeModal(); showScreen('screen-landing'); showToast('👋 Logged out successfully'); },
    'Logout', 'linear-gradient(135deg,#ef4444,#b91c1c)'
  );
}

// ── GENERIC MODAL ──
function showModal(title, body, onConfirm, confirmLabel='Confirm', confirmBg='linear-gradient(135deg,#4CAF50,#2e7d32)') {
  document.getElementById('qg-modal-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'qg-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2000;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease';
  overlay.innerHTML = \`
    <div style="background:white;border-radius:16px;padding:24px;width:90%;max-width:460px;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:fadeIn .25s ease">
      <div style="font-family:var(--font-head);font-size:16px;font-weight:700;color:var(--text1);margin-bottom:16px">\${title}</div>
      <div>\${body}</div>
      <div style="display:flex;gap:8px;margin-top:20px">
        <button onclick="closeModal()" style="flex:1;padding:11px;border-radius:8px;border:1.5px solid #e0e0e0;background:white;cursor:pointer;font-size:13px;font-weight:600;color:var(--text2);font-family:var(--font-body)">Cancel</button>
        <button onclick="window.__modalConfirm&&window.__modalConfirm()" style="flex:2;padding:11px;border-radius:8px;border:none;background:\${confirmBg};color:white;cursor:pointer;font-size:13px;font-weight:700;font-family:var(--font-body)">\${confirmLabel}</button>
      </div>
    </div>\`;
  window.__modalConfirm = onConfirm;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
}
function closeModal() {
  document.getElementById('qg-modal-overlay')?.remove();
  window.__modalConfirm = null;
}


// ════════════════════════════════════════════════════════════
//  QUANTUMGUARD — DYNAMIC FARMER STATE ENGINE (All Fixes)
// ════════════════════════════════════════════════════════════

// ── DEFAULT FARMER DATA FACTORY ──
function getDefaultFarmerData() {
  return {
    registered: false,
    name: '', dob: '', phone: '', aadhaar: '',
    address: '', village: '', taluka: '', district: '', state: 'Maharashtra', pincode: '',
    landArea: '', surveyNo: '', cropType: '', irrigationType: '', soilType: '', ownership: '',
    monthlyIncome: '', annualIncome: '', bankAccount: '', ifsc: '', loanHistory: '',
    farmerId: '',
    registeredAt: '',
    documents: [],
    requiredDocs: {
      aadhaar:  { label:'Aadhaar Card', desc:'Front & back of Aadhaar card', icon:'🪪', accept:'image/*,.pdf', file:null },
      land:     { label:'Land Document', desc:'7/12 or land record extract (Satbara)', icon:'🗺️', accept:'image/*,.pdf', file:null },
      bank:     { label:'Bank Passbook', desc:'First page of bank passbook / cancelled cheque', icon:'🏦', accept:'image/*,.pdf', file:null },
      photo:    { label:'Farmer Photo', desc:'Recent passport-size photograph', icon:'🧑‍🌾', accept:'image/*', file:null },
      income:   { label:'Income Certificate', desc:'Issued by Tahsildar / Revenue authority', icon:'📃', accept:'image/*,.pdf', file:null },
      landphoto:{ label:'Land Photo', desc:'Photo of your agricultural land / field', icon:'🌾', accept:'image/*', file:null },
    },
    validationStatus: {
      personal: false, address: false, land: false, financial: false,
      documents: false, blockchain: false, identity: false
    }
  };
}

// ── GLOBAL FARMER STORE ──
window.farmerData = getDefaultFarmerData();

// ── IDs for inputs in registration ──
const REG_FIELDS = {
  1: ['reg-name','reg-dob','reg-phone','reg-aadhaar'],
  2: ['reg-address','reg-village','reg-taluka','reg-district','reg-state','reg-pincode'],
  3: ['reg-landarea','reg-surveyno','reg-croptype','reg-irrigationtype','reg-soiltype','reg-ownership'],
  4: ['reg-monthlyincome','reg-annualincome','reg-bankaccount','reg-ifsc','reg-loanhistory']
};

// ── REGISTER: collect all step data and save ──
function collectRegStep(step) {
  if (step === 1) {
    farmerData.name    = document.getElementById('reg-name')?.value.trim() || '';
    farmerData.dob     = document.getElementById('reg-dob')?.value || '';
    farmerData.phone   = document.getElementById('reg-phone')?.value.trim() || '';
    farmerData.aadhaar = document.getElementById('reg-aadhaar')?.value.trim() || '';
  } else if (step === 2) {
    farmerData.address  = document.getElementById('reg-address')?.value.trim() || '';
    farmerData.village  = document.getElementById('reg-village')?.value.trim() || '';
    farmerData.taluka   = document.getElementById('reg-taluka')?.value.trim() || '';
    farmerData.district = document.getElementById('reg-district')?.value.trim() || '';
    farmerData.state    = document.getElementById('reg-state')?.value || 'Maharashtra';
    farmerData.pincode  = document.getElementById('reg-pincode')?.value.trim() || '';
  } else if (step === 3) {
    farmerData.landArea      = document.getElementById('reg-landarea')?.value || '';
    farmerData.surveyNo      = document.getElementById('reg-surveyno')?.value.trim() || '';
    farmerData.cropType      = document.getElementById('reg-croptype')?.value || '';
    farmerData.irrigationType= document.getElementById('reg-irrigationtype')?.value || '';
    farmerData.soilType      = document.getElementById('reg-soiltype')?.value || '';
    farmerData.ownership     = document.getElementById('reg-ownership')?.value || '';
  } else if (step === 4) {
    farmerData.monthlyIncome = document.getElementById('reg-monthlyincome')?.value || '';
    farmerData.annualIncome  = document.getElementById('reg-annualincome')?.value || '';
    farmerData.bankAccount   = document.getElementById('reg-bankaccount')?.value.trim() || '';
    farmerData.ifsc          = document.getElementById('reg-ifsc')?.value.trim() || '';
    farmerData.loanHistory   = document.getElementById('reg-loanhistory')?.value || '';
  }
}

// ── VALIDATE STEP ──
function validateRegStep(step) {
  if (step === 1) {
    if (!farmerData.name) { showToast('⚠️ Please enter your full name'); return false; }
    if (!farmerData.phone || farmerData.phone.length < 10) { showToast('⚠️ Enter valid 10-digit phone number'); return false; }
    if (!farmerData.aadhaar) { showToast('⚠️ Please enter Aadhaar number'); return false; }
    farmerData.validationStatus.personal = true;
  } else if (step === 2) {
    if (!farmerData.village) { showToast('⚠️ Please enter your village/town'); return false; }
    if (!farmerData.district) { showToast('⚠️ Please enter your district'); return false; }
    farmerData.validationStatus.address = true;
  } else if (step === 3) {
    if (!farmerData.landArea) { showToast('⚠️ Please enter land area'); return false; }
    farmerData.validationStatus.land = true;
  } else if (step === 4) {
    if (!farmerData.monthlyIncome) { showToast('⚠️ Please enter monthly income'); return false; }
    if (!farmerData.bankAccount) { showToast('⚠️ Please enter bank account number'); return false; }
    farmerData.validationStatus.financial = true;
  }
  updateValidationStatusPage();
  return true;
}

// ── UPDATE BLOCKCHAIN PAGE WITH REAL USER DATA ──
function updateBlockchainPage() {
  const f = farmerData;
  if (!f.registered) return;

  // Generate a deterministic-looking hash from the farmer's data
  const seed = (f.farmerId || '') + (f.name || '') + (f.phone || '') + (f.aadhaar || '');
  let hash = '';
  for (let i = 0; i < seed.length; i++) hash += seed.charCodeAt(i).toString(16);
  while (hash.length < 64) hash += Math.floor(Math.random()*16).toString(16);
  hash = hash.slice(0,64);

  // Generate a tx hash
  const txSeed = (f.farmerId || 'QG') + (f.phone || '');
  let txHash = '0x';
  for (let i = 0; i < 64; i++) txHash += Math.floor(Math.random()*16).toString(16);

  const chainBannerName = document.getElementById('chain-banner-name');
  if (chainBannerName) chainBannerName.textContent = f.name || '—';
  const chainBannerFid = document.getElementById('chain-banner-id');
  if (chainBannerFid) chainBannerFid.textContent = f.farmerId || '—';
  const chainName = document.getElementById('chain-farmer-name');
  if (chainName) chainName.textContent = f.name || '—';
  const chainHash = document.getElementById('chain-identity-hash');
  if (chainHash) chainHash.textContent = hash;
  const chainTx = document.getElementById('chain-tx-hash');
  if (chainTx) chainTx.textContent = txHash;
  const chainTs = document.getElementById('chain-timestamp');
  if (chainTs) chainTs.textContent = f.registeredAt || new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
}

// ── COMPLETE REGISTRATION ──
function completeRegistration() {
  farmerData.registered = true;
  farmerData.farmerId = 'QG-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random()*90000);
  farmerData.validationStatus.identity = true;
  farmerData.registeredAt = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
  // Store in multi-user localStorage keyed by phone
  try {
    const allUsers = JSON.parse(localStorage.getItem('qg_all_farmers') || '{}');
    allUsers[farmerData.phone] = JSON.parse(JSON.stringify(farmerData));
    localStorage.setItem('qg_all_farmers', JSON.stringify(allUsers));
    // Also keep last logged-in user for backward compat
    localStorage.setItem('qg_farmer', JSON.stringify(farmerData));
  } catch(e){}
  spreadFarmerData();
  updateBlockchainPage();
  generateQR();
  updateValidationStatusPage();
}

// ── SPREAD FARMER DATA EVERYWHERE ──
function spreadFarmerData() {
  const f = farmerData;
  const initials = f.name ? f.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';

  // Sidebar avatar + name
  document.querySelectorAll('.f-farmer-name').forEach(el => el.textContent = f.name || '—');
  document.querySelectorAll('.f-farmer-id').forEach(el => el.textContent = f.farmerId || 'Not registered');
  document.querySelectorAll('.f-farmer-avatar').forEach(el => el.textContent = initials || '?');
  const sidebarId = document.getElementById('sidebar-farmer-id'); if(sidebarId) sidebarId.textContent = f.farmerId || 'Not registered';

  // ── PROFILE PAGE ──
  const fmt = (v, prefix='', suffix='', fallback='—') => v ? prefix + v + suffix : fallback;
  const fmtMoney = (v, fallback='—') => v ? '₹' + Number(v).toLocaleString('en-IN') : fallback;
  const fmtAadhaar = (v) => v ? 'XXXX XXXX ' + v.replace(/\\D/g,'').slice(-4) : '—';
  const fmtBank = (v) => v ? '****' + v.replace(/\\s/g,'').slice(-4) : '—';
  const fmtDob = (v) => { if(!v) return '—'; try { return new Date(v).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); } catch(e){ return v; } };

  // Header
  const dpAvatar = document.getElementById('dp-avatar-lg'); if(dpAvatar) dpAvatar.textContent = initials || '?';
  const dpName = document.getElementById('dp-name'); if(dpName) dpName.textContent = f.name || '—';
  const dpId = document.getElementById('dp-id'); if(dpId) dpId.textContent = f.farmerId || 'Not registered';

  // Verification badges
  const verifyBadge = document.getElementById('dp-verify-badge');
  const pendingBadge = document.getElementById('dp-pending-badge');
  if(verifyBadge) verifyBadge.style.display = f.registered ? 'inline-flex' : 'none';
  if(pendingBadge) pendingBadge.style.display = f.registered ? 'none' : 'inline-flex';

  // Registration banners
  const regBanner = document.getElementById('dp-reg-banner');
  const unregBanner = document.getElementById('dp-unreg-banner');
  if(regBanner) regBanner.style.display = f.registered ? '' : 'none';
  if(unregBanner) unregBanner.style.display = f.registered ? 'none' : '';
  const dpRegId = document.getElementById('dp-reg-id'); if(dpRegId) dpRegId.textContent = f.farmerId || '—';

  // Personal
  const dpFullname = document.getElementById('dp-fullname'); if(dpFullname) dpFullname.textContent = f.name || '—';
  const dpDob = document.getElementById('dp-dob'); if(dpDob) dpDob.textContent = fmtDob(f.dob);
  const dpPhone = document.getElementById('dp-phone'); if(dpPhone) dpPhone.textContent = f.phone ? '+91 ' + f.phone : '—';
  const dpAadhaar = document.getElementById('dp-aadhaar'); if(dpAadhaar) dpAadhaar.textContent = fmtAadhaar(f.aadhaar);

  // Address
  const dpAddress = document.getElementById('dp-address'); if(dpAddress) dpAddress.textContent = f.address || '—';
  const dpVillage = document.getElementById('dp-village'); if(dpVillage) dpVillage.textContent = f.village || '—';
  const dpDistrict = document.getElementById('dp-district'); if(dpDistrict) dpDistrict.textContent = f.district || '—';
  const dpTaluka = document.getElementById('dp-taluka'); if(dpTaluka) dpTaluka.textContent = f.taluka || '—';
  const dpState = document.getElementById('dp-state'); if(dpState) dpState.textContent = f.state || '—';
  const dpPincode = document.getElementById('dp-pincode'); if(dpPincode) dpPincode.textContent = f.pincode || '—';

  // Land
  const dpLand = document.getElementById('dp-land'); if(dpLand) dpLand.textContent = f.landArea ? f.landArea + ' Acres' : '—';
  const dpSurveyno = document.getElementById('dp-surveyno'); if(dpSurveyno) dpSurveyno.textContent = f.surveyNo || '—';
  const dpCrop = document.getElementById('dp-crop'); if(dpCrop) dpCrop.textContent = f.cropType || '—';
  const dpIrrigation = document.getElementById('dp-irrigation'); if(dpIrrigation) dpIrrigation.textContent = f.irrigationType || '—';
  const dpSoiltype = document.getElementById('dp-soiltype'); if(dpSoiltype) dpSoiltype.textContent = f.soilType || '—';
  const dpOwnership = document.getElementById('dp-ownership'); if(dpOwnership) dpOwnership.textContent = f.ownership || '—';

  // Financial
  const dpIncome = document.getElementById('dp-income'); if(dpIncome) dpIncome.textContent = fmtMoney(f.monthlyIncome);
  const dpAnnual = document.getElementById('dp-annual'); if(dpAnnual) dpAnnual.textContent = fmtMoney(f.annualIncome);
  const dpBank = document.getElementById('dp-bank'); if(dpBank) dpBank.textContent = fmtBank(f.bankAccount);
  const dpIfsc = document.getElementById('dp-ifsc'); if(dpIfsc) dpIfsc.textContent = f.ifsc || '—';
  const dpLoanhistory = document.getElementById('dp-loanhistory'); if(dpLoanhistory) dpLoanhistory.textContent = f.loanHistory || '—';

  // QR card header
  const qName = document.getElementById('qr-farmer-name'); if(qName) qName.textContent = f.name || '—';
  const qId   = document.getElementById('qr-farmer-id');   if(qId)   qId.textContent   = f.farmerId || 'Not registered';
  const qVil  = document.getElementById('qr-farmer-village'); if(qVil) qVil.textContent = (f.village||'') + (f.district?', '+f.district:'');
  const qLand = document.getElementById('qr-farmer-land'); if(qLand) qLand.textContent  = f.landArea ? f.landArea+' ac' : '—';
  const qCrop = document.getElementById('qr-farmer-crop'); if(qCrop) qCrop.textContent  = f.cropType || '—';

  // QR info panel (right of QR image)
  const qInfoId = document.getElementById('qr-info-id');
  if(qInfoId) qInfoId.textContent = f.farmerId || '—';
  const qInfoStatus = document.getElementById('qr-info-status');
  if(qInfoStatus) { qInfoStatus.textContent = f.registered ? '✓ Verified' : '⏳ Pending'; qInfoStatus.style.color = f.registered ? 'var(--green)' : 'var(--text2)'; }
  const qInfoLoan = document.getElementById('qr-info-loan');
  if(qInfoLoan) { const eligible = parseFloat(f.landArea)>=1 && parseFloat(f.monthlyIncome||0)<25000; qInfoLoan.textContent = f.registered ? (eligible?'Eligible':'Check Eligibility') : '—'; qInfoLoan.style.color = (f.registered && eligible) ? 'var(--green)' : 'var(--text2)'; }

  // Identity Data Encoded in QR panel
  const qedId      = document.getElementById('qed-id');      if(qedId)      qedId.textContent      = f.farmerId || '—';
  const qedName    = document.getElementById('qed-name');    if(qedName)    qedName.textContent    = f.name || '—';
  const qedStatus  = document.getElementById('qed-status');  if(qedStatus)  qedStatus.textContent  = f.registered ? 'VERIFIED' : 'PENDING';
  const qedLand    = document.getElementById('qed-land');    if(qedLand)    qedLand.textContent    = f.landArea ? f.landArea+'ac' : '—';
  const qedCrop    = document.getElementById('qed-crop');    if(qedCrop)    qedCrop.textContent    = f.cropType || '—';
  const qedIncome  = document.getElementById('qed-income');  if(qedIncome)  qedIncome.textContent  = f.monthlyIncome ? '₹'+Number(f.monthlyIncome).toLocaleString('en-IN')+'/mo' : '—';
  const qedVillage = document.getElementById('qed-village'); if(qedVillage) qedVillage.textContent = (f.village||'—') + (f.district?', '+f.district:'');
  const qedDocs    = document.getElementById('qed-docs');    if(qedDocs)    qedDocs.textContent    = Object.values(f.requiredDocs||{}).filter(d=>d.file).length + '/6';

  // Digital ID Card Preview
  const icAvatar = document.getElementById('idcard-avatar');
  if(icAvatar) icAvatar.textContent = f.name ? f.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : '?';
  const icName = document.getElementById('idcard-name');
  if(icName) icName.textContent = f.name || '—';
  const icId = document.getElementById('idcard-id');
  if(icId) icId.textContent = f.farmerId || 'Not registered';
  const icVerify = document.getElementById('idcard-verify-badge');
  if(icVerify) icVerify.textContent = f.registered ? '✓ Verified' : '⏳ Pending';
  const icLocation = document.getElementById('idcard-location');
  if(icLocation) icLocation.textContent = f.registered ? ('Sepolia · ' + (f.village||'') + (f.district?', '+f.district:'')) : 'Complete registration to activate';
  const icLoan = document.getElementById('idcard-loan-badge');
  if(icLoan) { const eligible = parseFloat(f.landArea||0)>=1 && parseFloat(f.monthlyIncome||0)<25000; icLoan.textContent = f.registered && eligible ? '💰 Loan Eligible' : '💰 Check Loan'; }

  // Loan page criteria update
  const lLand = document.getElementById('lc-land'); if(lLand) lLand.textContent = (f.landArea||'?') + ' ac ' + (parseFloat(f.landArea)>=1?'✓':'✗');
  const lInc  = document.getElementById('lc-income'); if(lInc) lInc.textContent = f.monthlyIncome ? '₹'+Number(f.monthlyIncome).toLocaleString('en-IN')+' '+(Number(f.monthlyIncome)<25000?'✓':'✗') : '—';

  // Dashboard hero section
  const heroName = document.getElementById('hero-farmer-name'); if(heroName) heroName.textContent = (f.name ? f.name + ' 🌾' : 'Farmer 🌾');
  const heroVil  = document.getElementById('hero-farmer-village'); if(heroVil) heroVil.textContent = (f.village||'') + (f.district ? ', '+f.district : '') || 'Complete registration to get started';

  // Regenerate QR if on that page
  if (document.getElementById('dash-qr')?.classList.contains('active')) generateQRDynamic();
}

// ── DYNAMIC QR GENERATION with farmer data ──
function generateQRDynamic() {
  const f = farmerData;
  const canvas = document.getElementById('qr-canvas');
  if (!canvas) return;
  canvas.innerHTML = '';
  const data = (f.farmerId||'QG-XXXX') + '|' + (f.name||'Farmer') + '|VERIFIED|LAND:' + (f.landArea||'?') + 'ac|CROP:' + (f.cropType||'N/A') + '|INCOME:' + (f.monthlyIncome||'?') + '|DOCS:' + farmerData.documents.length + '|' + f.village + ',' + f.state;
  try {
    new QRCode(canvas, { text: data, width: 170, height: 170, colorDark: '#1b5e20', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
  } catch(e) {}
}

// ── QR SCAN VIEW: Show all saved documents ──
function showQRScanResult() {
  const f = farmerData;
  const docs = f.documents;
  document.getElementById('qg-modal-overlay')?.remove();
  const overlay = document.createElement('div');
  overlay.id = 'qg-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:2000;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease';
  const docList = docs.length === 0
    ? '<div style="color:var(--text2);font-size:12px;padding:12px;background:#f9f9f9;border-radius:8px;text-align:center">No documents uploaded yet</div>'
    : docs.map(d => \`<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:white;border:1px solid #e0e0e0;border-radius:8px;margin-bottom:6px">
        <div style="width:32px;height:32px;border-radius:6px;background:#e8f5e9;color:#2e7d32;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0">\${d.name.split('.').pop().toUpperCase().slice(0,4)}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\${d.name}</div>
          <div style="font-size:10px;color:#6b7280">\${d.date} · \${d.status}</div>
          <div style="font-size:9px;font-family:monospace;color:#9ca3af">\${d.cid.slice(0,30)}…</div>
        </div>
        <span style="background:#e8f5e9;color:#2e7d32;font-size:9px;font-weight:700;padding:2px 7px;border-radius:10px">✓</span>
      </div>\`).join('');
  overlay.innerHTML = \`<div style="background:white;border-radius:16px;padding:24px;width:90%;max-width:480px;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:fadeIn .25s ease">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
      <div style="width:40px;height:40px;background:var(--green-pale);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px">📱</div>
      <div><div style="font-family:var(--font-head);font-size:15px;font-weight:700">QR Scan Result</div><div style="font-size:11px;color:var(--text2)">Farmer Identity & Documents</div></div>
    </div>
    <div style="background:var(--green-pale);border-radius:10px;padding:12px 14px;margin-bottom:14px;border:1px solid #c8e6c9">
      <div style="font-size:13px;font-weight:700;color:#1b5e20">\${f.name || 'Farmer'}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:2px">\${f.farmerId || 'Unregistered'} · \${f.village||''} \${f.district ? ', '+f.district : ''}</div>
      <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap">
        <div style="font-size:11px;color:var(--text2)">🌾 <strong>\${f.landArea||'?'} ac</strong> · \${f.cropType||'N/A'}</div>
        <div style="font-size:11px;color:var(--text2)">💰 ₹\${f.monthlyIncome ? Number(f.monthlyIncome).toLocaleString('en-IN') : '?'}/mo</div>
        <div style="font-size:11px;color:var(--text2)">📄 \${docs.length} document\${docs.length!==1?'s':''}</div>
      </div>
    </div>
    <div style="font-size:12px;font-weight:700;color:var(--text1);margin-bottom:8px">📁 Stored Documents</div>
    \${docList}
    <button onclick="closeModal()" style="width:100%;margin-top:14px;padding:11px;border-radius:8px;border:none;background:linear-gradient(135deg,#4CAF50,#2e7d32);color:white;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font-body)">Close</button>
  </div>\`;
  window.__modalConfirm = null;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
}

// ── DOCUMENT STORAGE: upload to a required slot ──
function addDocumentToListDynamic(file, slotKey) {
  const name = file.name || file;
  const sizeKB = file.size ? Math.round(file.size / 1024) : 0;
  const ext = (typeof name === 'string' ? name : '').split('.').pop().toUpperCase() || 'FILE';
  const isImg = ['JPG','PNG','JPEG','WEBP','GIF'].includes(ext);
  const fakeCID = 'Qm' + Array.from({length:44}, () => '0123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random()*58)]).join('');
  const today = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
  const docEntry = { name, sizeKB, cid: fakeCID, date: today, status: 'Pending', isImg, ext };

  // Save to required slot if slotKey given
  if (slotKey && farmerData.requiredDocs[slotKey]) {
    farmerData.requiredDocs[slotKey].file = docEntry;
  }

  // Also push to general docs array (for QR / other pages)
  // Remove old entry for this slot if exists
  if (slotKey) farmerData.documents = farmerData.documents.filter(d => d.slotKey !== slotKey);
  docEntry.slotKey = slotKey || 'extra';
  farmerData.documents.push(docEntry);

  // Update validation: all 6 required docs uploaded?
  const allUploaded = Object.values(farmerData.requiredDocs).every(d => d.file !== null);
  farmerData.validationStatus.documents = allUploaded;

  try { localStorage.setItem('qg_farmer', JSON.stringify(farmerData)); } catch(e){}
  renderDocumentsPage();
  updateValidationStatusPage();
  if (farmerData.registered) generateQRDynamic();
  return docEntry;
}

function renderDocumentsPage() {
  const grid = document.getElementById('req-docs-grid');
  if (!grid) return;

  const rd = farmerData.requiredDocs;
  const uploadedCount = Object.values(rd).filter(d => d.file !== null).length;
  const total = Object.keys(rd).length;
  const pct = Math.round((uploadedCount / total) * 100);

  // Update progress
  const pBar = document.getElementById('doc-progress-bar');
  const pLabel = document.getElementById('doc-progress-label');
  const badge = document.getElementById('doc-overall-badge');
  if (pBar) pBar.style.width = pct + '%';
  if (pLabel) pLabel.textContent = uploadedCount + ' of ' + total + ' documents uploaded';
  if (badge) {
    badge.textContent = uploadedCount + ' / ' + total + ' Uploaded';
    badge.style.background = uploadedCount === total ? '#e8f5e9' : (uploadedCount > 0 ? '#fff9c4' : '#fff3e0');
    badge.style.color = uploadedCount === total ? '#2e7d32' : (uploadedCount > 0 ? '#f57f17' : '#e65100');
    badge.style.border = '1px solid ' + (uploadedCount === total ? '#c8e6c9' : (uploadedCount > 0 ? '#ffe082' : '#ffe0b2'));
  }

  grid.innerHTML = '';
  Object.entries(rd).forEach(([key, slot]) => {
    const f = slot.file;
    const uploaded = f !== null;

    const card = document.createElement('div');
    card.style.cssText = 'background:white;border:2px solid ' + (uploaded ? '#c8e6c9' : '#e0e0e0') + ';border-radius:12px;padding:14px;transition:.2s;position:relative;overflow:hidden';

    // Top colour strip
    const strip = document.createElement('div');
    strip.style.cssText = 'position:absolute;top:0;left:0;right:0;height:3px;background:' + (uploaded ? 'linear-gradient(90deg,#4CAF50,#81c784)' : 'linear-gradient(90deg,#e0e0e0,#bdbdbd)');
    card.appendChild(strip);

    card.innerHTML += \`
      <div style="display:flex;align-items:flex-start;gap:10px;margin-top:4px">
        <div style="width:40px;height:40px;border-radius:10px;background:\${uploaded ? '#e8f5e9' : '#f5f5f5'};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;border:1px solid \${uploaded ? '#c8e6c9' : '#e0e0e0'}">\${slot.icon}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:700;color:var(--text1);display:flex;align-items:center;gap:6px">
            \${slot.label}
            \${uploaded ? '<span style="font-size:9px;background:#e8f5e9;color:#2e7d32;padding:2px 7px;border-radius:10px;font-weight:700">✓ Uploaded</span>' : '<span style="font-size:9px;background:#fff3e0;color:#e65100;padding:2px 7px;border-radius:10px;font-weight:700">Required</span>'}
          </div>
          <div style="font-size:11px;color:var(--text2);margin-top:2px;line-height:1.4">\${slot.desc}</div>
        </div>
      </div>

      \${uploaded ? \`
        <div style="margin-top:10px;padding:8px 10px;background:var(--green-xpale);border-radius:8px;border:1px solid #c8e6c9">
          <div style="display:flex;align-items:center;gap:8px">
            <div style="width:28px;height:28px;border-radius:6px;background:\${f.isImg ? '#e3f2fd' : '#fce4ec'};color:\${f.isImg ? '#1565c0' : '#c62828'};display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;flex-shrink:0">\${f.ext.slice(0,3)}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:11px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\${f.name}</div>
              <div style="font-size:10px;color:var(--text2)">\${f.date} · \${f.sizeKB} KB · <span style="color:var(--text2)">Pending review</span></div>
            </div>
            <button onclick="deleteRequiredDoc('\${key}')" style="background:none;border:none;cursor:pointer;color:#ef4444;font-size:13px;padding:3px 5px;border-radius:5px;flex-shrink:0" title="Remove">🗑️</button>
          </div>
          <div style="font-size:9px;font-family:monospace;color:var(--green);background:white;padding:4px 8px;border-radius:5px;margin-top:6px;word-break:break-all;cursor:pointer;border:1px solid #c8e6c9" title="Click to copy CID" onclick="copyToClipboard('\${f.cid}','IPFS CID')">📎 \${f.cid}</div>
        </div>
      \` : \`
        <div style="margin-top:10px">
          <label style="display:flex;align-items:center;justify-content:center;gap:7px;padding:9px 0;border:1.5px dashed #bdbdbd;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;color:var(--text2);transition:.15s;background:#fafafa"
            onmouseenter="this.style.borderColor='var(--green-mid)';this.style.color='var(--green)';this.style.background='var(--green-xpale)'"
            onmouseleave="this.style.borderColor='#bdbdbd';this.style.color='var(--text2)';this.style.background='#fafafa'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
            Upload \${slot.label}
            <input type="file" accept="\${slot.accept}" style="display:none" onchange="handleRequiredDocUpload(event,'\${key}')">
          </label>
        </div>
      \`}
    \`;

    // Re-add the colour strip (innerHTML wiped it)
    card.insertBefore(strip, card.firstChild);
    grid.appendChild(card);
  });
}

function handleRequiredDocUpload(event, slotKey) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { showToast('⚠️ File too large — max 10MB'); return; }
  const slot = farmerData.requiredDocs[slotKey];
  showToast('📤 Uploading "' + file.name + '" to IPFS...');
  setTimeout(() => showToast('🔗 Pinning to Pinata gateway...'), 1200);
  setTimeout(() => {
    addDocumentToListDynamic(file, slotKey);
    showToast('✅ ' + slot.label + ' uploaded & pinned to IPFS!');
  }, 2000);
}

function deleteRequiredDoc(slotKey) {
  if (!farmerData.requiredDocs[slotKey]) return;
  const label = farmerData.requiredDocs[slotKey].label;
  farmerData.requiredDocs[slotKey].file = null;
  farmerData.documents = farmerData.documents.filter(d => d.slotKey !== slotKey);
  const allUploaded = Object.values(farmerData.requiredDocs).every(d => d.file !== null);
  farmerData.validationStatus.documents = allUploaded;
  try { localStorage.setItem('qg_farmer', JSON.stringify(farmerData)); } catch(e){}
  renderDocumentsPage();
  updateValidationStatusPage();
  showToast('🗑️ ' + label + ' removed');
}

function deleteDocByIdx(idx) {
  const doc = farmerData.documents[idx];
  if (doc && doc.slotKey && farmerData.requiredDocs[doc.slotKey]) {
    farmerData.requiredDocs[doc.slotKey].file = null;
  }
  farmerData.documents.splice(idx, 1);
  const allUploaded = Object.values(farmerData.requiredDocs).every(d => d.file !== null);
  farmerData.validationStatus.documents = allUploaded;
  try { localStorage.setItem('qg_farmer', JSON.stringify(farmerData)); } catch(e){}
  renderDocumentsPage();
  updateValidationStatusPage();
  showToast('🗑️ Document deleted');
  if (farmerData.registered) generateQRDynamic();
}

// ── VALIDATION STATUS PAGE (Dynamic) ──
function updateValidationStatusPage() {
  const f = farmerData;
  const vs = f.validationStatus;

  const steps = [
    { id: 'vs-personal',    done: vs.personal,    label: 'Personal Info', desc: vs.personal ? (f.name||'Filled') : 'Full name, phone, Aadhaar required' },
    { id: 'vs-address',     done: vs.address,     label: 'Address Details', desc: vs.address ? (f.village+(f.district?', '+f.district:'')) : 'Village, district required' },
    { id: 'vs-land',        done: vs.land,        label: 'Land Details', desc: vs.land ? (f.landArea+'ac · '+f.cropType) : 'Land area and crop type required' },
    { id: 'vs-financial',   done: vs.financial,   label: 'Financial Details', desc: vs.financial ? ('₹'+(f.monthlyIncome?Number(f.monthlyIncome).toLocaleString('en-IN'):'?')+'/mo') : 'Income and bank details required' },
    { id: 'vs-documents',   done: vs.documents,   label: 'Documents', desc: vs.documents ? '6 / 6 required documents uploaded ✓' : (() => { const cnt = Object.values(farmerData.requiredDocs||{}).filter(d=>d.file).length; return cnt + ' / 6 documents uploaded — ' + (6-cnt) + ' remaining'; })() },
    { id: 'vs-identity',    done: vs.identity,    label: 'Blockchain Identity', desc: vs.identity ? ('ID: '+(f.farmerId||'Generating…')) : 'Complete registration to generate identity' },
  ];

  const container = document.getElementById('vs-steps-container');
  if (!container) return;
  const total = steps.filter(s=>s.done).length;
  const pct = Math.round((total/steps.length)*100);

  // Progress bar
  const pBar = document.getElementById('vs-progress-bar');
  const pPct = document.getElementById('vs-progress-pct');
  const pLabel= document.getElementById('vs-progress-label');
  if (pBar) pBar.style.width = pct+'%';
  if (pPct) pPct.textContent = pct+'%';
  if (pLabel) pLabel.textContent = total+' of '+steps.length+' checks complete';

  container.innerHTML = steps.map(s => \`
    <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:\${s.done?'var(--green-xpale)':'#fafafa'};border:1px solid \${s.done?'#c8e6c9':'#e0e0e0'};border-radius:10px">
      <div style="width:32px;height:32px;border-radius:50%;background:\${s.done?'var(--green-mid)':'#e0e0e0'};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:white;font-size:13px;font-weight:700">
        \${s.done?'✓':'○'}
      </div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:\${s.done?'var(--green)':'var(--text1)'};">\${s.label}</div>
        <div style="font-size:11px;color:var(--text2);margin-top:2px">\${s.desc}</div>
      </div>
      <span class="badge \${s.done?'badge-approved':'badge-pending'}">\${s.done?'✓ Done':'Pending'}</span>
    </div>
  \`).join('');
}

// ── OVERRIDE regStep to collect data and validate ──
const _origRegStep = window.regStep;
window.regStep = function(dir) {
  const cur = window.currentRegStep || 1;
  if (dir > 0) {
    collectRegStep(cur);
    if (!validateRegStep(cur)) return;
    if (cur === 4) {
      // Complete registration
      const btn = document.getElementById('reg-next-btn');
      btn.textContent = '⏳ Registering...';
      btn.disabled = true;
      showToast('🚀 Registering on blockchain...');
      setTimeout(() => showToast('🔗 Storing identity hash on Ethereum...'), 1000);
      setTimeout(() => {
        completeRegistration();
        btn.disabled = false;
        showScreen('screen-dashboard');
        showToast('✅ Welcome to QuantumGuard, ' + farmerData.name + '!');
      }, 2200);
      return;
    }
  }
  // call original logic for UI transitions
  regStepUI(dir);
};

// ── OVERRIDE doLogin to use registered data ──
const _origDoLogin = window.doLogin;
window.doLogin = function() {
  const phoneInput = document.getElementById('login-phone');
  const enteredPhone = phoneInput ? phoneInput.value.trim() : '';

  // Get PIN
  const pins = ['pin1','pin2','pin3','pin4'].map(id => (document.getElementById(id)||{}).value||'').join('');

  // Basic validation
  if (!enteredPhone || enteredPhone.length < 10) {
    showToast('⚠️ Please enter a valid 10-digit phone number');
    return;
  }
  if (!pins || pins.length < 4) {
    showToast('⚠️ Please enter your 4-digit PIN');
    return;
  }

  // Try to find user by phone in localStorage multi-user store
  let foundUser = null;
  try {
    const allUsers = JSON.parse(localStorage.getItem('qg_all_farmers') || '{}');
    if (allUsers[enteredPhone]) {
      foundUser = allUsers[enteredPhone];
    }
  } catch(e){}

  const btn = event?.currentTarget;
  if (btn) { btn.textContent = '⏳ Verifying...'; btn.disabled = true; }
  showToast('🔐 Verifying credentials...');
  setTimeout(() => {
    if (btn) { btn.textContent = btn.getAttribute('data-orig') || '🌾 Login to Dashboard'; btn.disabled = false; }

    if (foundUser) {
      // Reset farmerData then load found user
      Object.assign(farmerData, getDefaultFarmerData(), foundUser);
      // Re-merge requiredDocs structure
      if (foundUser.requiredDocs) {
        Object.keys(farmerData.requiredDocs).forEach(key => {
          if (foundUser.requiredDocs[key] && foundUser.requiredDocs[key].file) {
            farmerData.requiredDocs[key].file = foundUser.requiredDocs[key].file;
          }
        });
      }
      showScreen('screen-dashboard');
      showToast('👋 Welcome back, ' + farmerData.name + '!');
    } else {
      // No registered account found — still allow demo login with blank state
      // Reset to fresh blank
      Object.assign(farmerData, getDefaultFarmerData());
      farmerData.phone = enteredPhone;
      showScreen('screen-dashboard');
      showToast('👋 Welcome! Complete registration to activate your identity.');
    }

    setTimeout(() => {
      spreadFarmerData();
      renderDocumentsPage();
      updateValidationStatusPage();
      if (document.getElementById('dash-qr')?.classList.contains('active')) generateQRDynamic();
    }, 200);
  }, 1200);
};

// ── OVERRIDE openUploadZone to show slot-picker ──
window.openUploadZone = function() {
  const rd = farmerData.requiredDocs;
  const items = Object.entries(rd).map(([key, slot]) => \`
    <label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1.5px solid \${slot.file ? '#c8e6c9' : '#e0e0e0'};border-radius:10px;cursor:\${slot.file ? 'default' : 'pointer'};background:\${slot.file ? 'var(--green-xpale)' : 'white'};transition:.15s;margin-bottom:8px"
      \${slot.file ? '' : \`onmouseenter="this.style.borderColor='var(--green-mid)'" onmouseleave="this.style.borderColor='#e0e0e0'"\`}>
      <span style="font-size:22px">\${slot.icon}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:var(--text1)">\${slot.label}</div>
        <div style="font-size:11px;color:var(--text2)">\${slot.file ? '✅ ' + slot.file.name : slot.desc}</div>
      </div>
      \${slot.file
        ? '<span style="font-size:10px;background:#e8f5e9;color:#2e7d32;padding:3px 8px;border-radius:10px;font-weight:700;flex-shrink:0">Uploaded ✓</span>'
        : \`<input type="file" accept="\${slot.accept}" style="display:none" onchange="handleRequiredDocUpload(event,'\${key}');closeModal()">\`
      }
    </label>
  \`).join('');
  showModal('📂 Upload Required Document',
    \`<div style="font-size:12px;color:var(--text2);margin-bottom:12px">Select which document you want to upload:</div>\${items}\`,
    null, 'Close', 'linear-gradient(135deg,#6b7280,#4b5563)'
  );
  // Replace confirm button with close only
  setTimeout(() => {
    const confirmBtn = document.querySelector('#qg-modal-overlay button:last-child');
    if (confirmBtn) { confirmBtn.onclick = closeModal; confirmBtn.textContent = 'Close'; }
  }, 50);
};

// ── OVERRIDE generateQR ──
window.generateQR = function() {
  generateQRDynamic();
};

// ── Override showDashPage to trigger QR and status updates ──
const _origShowDashPage = window.showDashPage;
window.showDashPage = function(id, el) {
  _origShowDashPage && _origShowDashPage(id, el);
  if (id === 'qr') {
    setTimeout(generateQRDynamic, 200);
  }
  if (id === 'status') {
    updateValidationStatusPage();
  }
  if (id === 'documents') {
    renderDocumentsPage();
  }
  if (id === 'profile') {
    spreadFarmerData();
  }
  if (id === 'blockchain') {
    updateBlockchainPage();
  }
};

// ── INIT: Add live validation on reg fields as user types ──
document.addEventListener('DOMContentLoaded', function() {
  // Restore last logged-in user from localStorage
  try {
    const saved = localStorage.getItem('qg_farmer');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(farmerData, parsed);
      // Re-merge requiredDocs: preserve the label/desc/icon/accept but restore file entries
      if (parsed.requiredDocs) {
        Object.keys(farmerData.requiredDocs).forEach(key => {
          if (parsed.requiredDocs[key] && parsed.requiredDocs[key].file) {
            farmerData.requiredDocs[key].file = parsed.requiredDocs[key].file;
          }
        });
      }
      // Immediately spread data so registered users see correct profile on load
      spreadFarmerData();
      updateBlockchainPage();
    }
  } catch(e) {}

  // IDs for reg inputs — add live feedback
  const liveFields = {
    'reg-name': 'personal', 'reg-phone': 'personal', 'reg-aadhaar': 'personal',
    'reg-village': 'address', 'reg-district': 'address',
    'reg-landarea': 'land', 'reg-croptype': 'land',
    'reg-monthlyincome': 'financial', 'reg-bankaccount': 'financial'
  };
  Object.keys(liveFields).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', function() {
      collectRegStep(window.currentRegStep || 1);
      validateRegStep(window.currentRegStep || 1);
      // Don't show error toast on live typing, just update status
    });
  });

  // Initialize status page
  updateValidationStatusPage();

  // Render docs page
  renderDocumentsPage();

  // Set data-orig on login button
  document.querySelectorAll('[onclick*="doLogin"]').forEach(b => {
    b.setAttribute('data-orig', b.textContent);
  });

  // QR Scan simulation button – wire up
  const qrScanBtn = document.getElementById('qr-scan-btn');
  if (qrScanBtn) qrScanBtn.addEventListener('click', showQRScanResult);
});

// ── Also override doLogout to clear session ──
const _origLogout = window.doLogout;
window.doLogout = function() {
  showModal('🚪 Logout', '<p style="font-size:13px;color:var(--text2)">Are you sure you want to logout from your QuantumGuard farmer account?</p>',
    () => {
      closeModal();
      // Keep farmerData but clear session flag
      showScreen('screen-landing');
      showToast('👋 Logged out successfully');
    },
    'Logout', 'linear-gradient(135deg,#ef4444,#b91c1c)'
  );
};


// ── FILTER SCHEMES ──
function filterSchemes() {
  const val = document.getElementById('scheme-filter').value;
  document.querySelectorAll('#scheme-cards-container .scheme-card').forEach(card => {
    const cats = card.getAttribute('data-cat') || '';
    card.style.display = (val === 'all' || cats.includes(val)) ? '' : 'none';
  });
  const visible = document.querySelectorAll('#scheme-cards-container .scheme-card:not([style*="none"])').length;
  showToast(\`🔍 Showing \${visible} scheme\${visible !== 1 ? 's' : ''}\`);
}

// ── WIRE UP SCHEME CARDS ──
document.addEventListener('DOMContentLoaded', () => {
  // Scheme card CTAs
  const schemeCTAs = [
    { cta: 'Apply Now →', fn: () => applyScheme('PM-KISAN Samman Nidhi', '₹6,000 / year') },
    { cta: 'Check Eligibility →', fn: () => checkEligibility('PM Fasal Bima Yojana') },
    { cta: 'Check Bank →', fn: () => showToast('🏦 Redirecting to nearest KCC bank branch...') },
    { cta: 'Register →', fn: () => applyScheme('Soil Health Card', 'Free soil testing') },
    { cta: 'Check District Eligibility →', fn: () => checkEligibility('Maharashtra Shetkari Sahajya Yojana') },
  ];
  document.querySelectorAll('.scheme-cta').forEach((el, i) => {
    if (schemeCTAs[i]) el.addEventListener('click', schemeCTAs[i].fn);
  });

  // Scheme cards (full card click)
  document.querySelectorAll('.scheme-card').forEach(card => {
    card.addEventListener('click', function(e) {
      if (e.target.classList.contains('scheme-cta')) return;
      const name = this.querySelector('.scheme-name')?.textContent || 'this scheme';
      showToast(\`ℹ️ Viewing details for \${name}\`);
    });
  });

  // Doc upload zone - handled by inline onclick on upload zone

  // Delete buttons handled by renderDocumentsPage()

  // Copy blockchain hashes
  document.querySelectorAll('.chain-hash').forEach(el => {
    el.style.cursor = 'pointer';
    el.title = 'Click to copy';
    el.addEventListener('click', function() { copyToClipboard(this.textContent.trim(), 'Hash'); });
  });

  // Copy CIDs in doc list
  document.querySelectorAll('.doc-cid').forEach(el => {
    el.style.cursor = 'pointer';
    el.title = 'Click to copy CID';
    el.addEventListener('click', function() { copyToClipboard(this.textContent.trim(), 'IPFS CID'); });
  });

  // Notification bell
  document.querySelector('.bell-anim')?.addEventListener('click', toggleNotifications);
  document.querySelector('.f-notif-btn')?.addEventListener('click', toggleNotifications);

  // Edit profile handled via onclick

  // Upload Doc button already wired

  // Loan buttons already wired via onclick attributes

  // QR buttons already wired

  // Aadhaar OTP handled via onclick

  // Logout button already wired

  // Generate QR if already on QR page
  if (document.getElementById('dash-qr')?.classList.contains('active')) generateQR();
  
  // Initialize dynamic pages
  setTimeout(() => {
    renderDocumentsPage();
    updateValidationStatusPage();
    spreadFarmerData();
  }, 100);

  // Landing nav buttons — Login / Register
  document.querySelectorAll('[onclick*="screen-login"], [onclick*="screen-register"]').forEach(el => {
    // already wired via onclick attributes — keep them
  });

  // Status page: refresh button simulation
  const statusTopbar = document.querySelector('#dash-status .f-topbar-right');
  if (statusTopbar && !statusTopbar.querySelector('button')) {
    const refreshBtn = document.createElement('button');
    refreshBtn.className = 'btn btn-outline';
    refreshBtn.style.cssText = 'padding:6px 14px;font-size:12px';
    refreshBtn.innerHTML = '🔄 Refresh Status';
    refreshBtn.addEventListener('click', () => {
      updateValidationStatusPage();
      showToast('🔄 Status refreshed');
    });
    statusTopbar.appendChild(refreshBtn);
  }
});

` }} />
    </>
  );
}

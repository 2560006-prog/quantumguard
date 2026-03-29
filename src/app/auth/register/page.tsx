'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Poppins:wght@500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Nunito',sans-serif;background:#0f1a12;color:#e8f5e9}
.reg-page{position:fixed;inset:0;display:flex;overflow:hidden;background:#0f1a12}
.reg-left{width:320px;min-width:280px;flex-shrink:0;background:linear-gradient(160deg,#0a2e10 0%,#1b5e20 50%,#2e7d32 100%);display:flex;flex-direction:column;justify-content:center;padding:36px 28px;overflow-y:auto}
.reg-brand{display:flex;align-items:center;gap:10px;margin-bottom:24px}
.reg-brand-icon{width:40px;height:40px;background:rgba(255,255,255,.15);border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.reg-brand-name{font-family:'Poppins',sans-serif;font-size:19px;font-weight:700;color:white}
.reg-left-title{font-family:'Poppins',sans-serif;font-size:22px;font-weight:700;color:white;line-height:1.3;margin-bottom:8px}
.reg-left-title span{color:#86efac}
.reg-left-desc{font-size:12.5px;color:rgba(255,255,255,.6);line-height:1.7;margin-bottom:24px}
.reg-steps{display:flex;flex-direction:column;gap:5px;margin-bottom:22px}
.reg-step{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:9px;border:1px solid rgba(255,255,255,.07);transition:.2s}
.reg-step.active{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.2)}
.reg-step.done{background:rgba(74,222,128,.1);border-color:rgba(74,222,128,.2)}
.reg-step.upcoming{opacity:.4}
.reg-step-icon{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
.reg-step-icon.active{background:rgba(255,255,255,.2);color:white}
.reg-step-icon.done{background:#4ade80;color:#14532d}
.reg-step-icon.upcoming{background:rgba(255,255,255,.07);color:rgba(255,255,255,.35)}
.reg-step-name{font-size:12.5px;font-weight:700;color:white}
.reg-step-desc{font-size:11px;color:rgba(255,255,255,.45)}
.reg-benefits{display:flex;flex-direction:column;gap:6px}
.reg-benefit{display:flex;align-items:center;gap:8px;font-size:12px;color:rgba(255,255,255,.65)}
.reg-bdot{width:5px;height:5px;border-radius:50%;background:#86efac;flex-shrink:0}
.reg-right{flex:1;min-width:0;display:flex;align-items:flex-start;justify-content:center;padding:36px 44px;background:#111b13;overflow-y:auto}
.reg-form{width:100%;max-width:560px}
.reg-stepper{display:flex;align-items:center;margin-bottom:24px}
.reg-sc{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;border:2px solid;transition:.2s}
.reg-sc.done{background:#22c55e;border-color:#22c55e;color:white}
.reg-sc.cur{background:transparent;border-color:#4ade80;color:#4ade80}
.reg-sc.next{background:transparent;border-color:#1e3520;color:#2d4a30}
.reg-sl{flex:1;height:2px;margin:0 5px}
.reg-sl.done{background:#22c55e}
.reg-sl.next{background:#1e3520}
.reg-ftitle{font-family:'Poppins',sans-serif;font-size:20px;font-weight:700;color:#f0fdf4;margin-bottom:3px}
.reg-fsub{font-size:12.5px;color:#4b5563;margin-bottom:20px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:13px 18px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:13px 16px}
.gfull{grid-column:1/-1}
.flabel{display:block;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
.finp{height:46px;width:100%;background:#1a2b1c;border:1.5px solid #2d4a30;border-radius:9px;padding:0 13px;font-size:14px;font-family:'Nunito',sans-serif;color:#e8f5e9;outline:none;transition:border-color .2s,background .2s}
.finp:focus{border-color:#4ade80;background:#1e3520;box-shadow:0 0 0 3px rgba(74,222,128,.08)}
.finp::placeholder{color:#374151}
.req{color:#ef4444;margin-left:2px}
.reg-btns{display:flex;gap:10px;margin-top:22px}
.btn-back{flex:1;height:46px;border-radius:10px;border:1.5px solid #2d4a30;background:transparent;color:#6b7280;font-size:14px;font-weight:600;cursor:pointer;font-family:'Nunito',sans-serif}
.btn-back:hover{border-color:#4b5563;color:#9ca3af}
.btn-next{flex:2;height:46px;border-radius:10px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;font-size:14px;font-weight:700;cursor:pointer;font-family:'Nunito',sans-serif;transition:.2s}
.btn-next:hover:not(:disabled){box-shadow:0 5px 20px rgba(34,197,94,.3);transform:translateY(-1px)}
.btn-next:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-submit{background:linear-gradient(135deg,#f59e0b,#d97706) !important}
.reg-signin{text-align:center;font-size:12.5px;color:#4b5563;margin-top:12px}
.reg-signin a{color:#4ade80;font-weight:700;text-decoration:none}
.info-box{margin-top:14px;padding:11px 13px;background:rgba(74,222,128,.05);border:1px solid rgba(74,222,128,.14);border-radius:8px;font-size:12px;color:#6ee7b7;line-height:1.6}
@media(max-width:820px){
  .reg-page{position:relative;min-height:100vh;flex-direction:column;overflow:auto}
  .reg-left{width:100%;min-width:unset;padding:28px 20px 22px}
  .reg-steps,.reg-benefits{display:none}
  .reg-right{padding:24px 18px 36px}
  .g3{grid-template-columns:1fr 1fr}
}
@media(max-width:480px){.g2,.g3{grid-template-columns:1fr}.gfull{grid-column:1}}
`;

// ── Field component OUTSIDE main component to prevent focus loss ──
type FP = { label:string; value:string; onChange:(v:string)=>void; req?:boolean; ph?:string; type?:string; opts?:string[]; max?:number };
function Field({ label, value, onChange, req, ph, type='text', opts, max }: FP) {
  return (
    <div style={{display:'flex',flexDirection:'column'}}>
      <label className="flabel">{label}{req && <span className="req">*</span>}</label>
      {opts
        ? <select className="finp" value={value} onChange={e=>onChange(e.target.value)}>
            {opts.map(o=><option key={o} style={{background:'#1a2b1c'}}>{o}</option>)}
          </select>
        : <input className="finp" type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={ph} maxLength={max} />
      }
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const sb = createClient();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name:'', email:'', password:'', confirm:'',
    mobile:'', aadhaar:'', address:'', village:'', district:'', state:'Maharashtra', pincode:'',
    landArea:'', cropType:'Wheat', irrigationType:'Borewell', soilType:'Black Cotton Soil', ownership:'Self-owned', surveyNo:'',
    bankName:'', accountNumber:'', ifsc:'', accountHolder:'', monthlyIncome:'',
  });

  useEffect(() => { setMounted(true); }, []);
  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({...f, [k]: v}));

  function nextStep() {
    if (step===1) {
      if (!form.name||!form.email||!form.password) { toast.error('Fill all required fields'); return; }
      if (form.password.length<6) { toast.error('Password must be 6+ characters'); return; }
      if (form.password!==form.confirm) { toast.error('Passwords do not match'); return; }
    }
    if (step===2 && (!form.mobile||!form.aadhaar)) { toast.error('Mobile and Aadhaar required'); return; }
    if (step===3 && !form.landArea) { toast.error('Land area is required'); return; }
    if (step<4) { setStep(s=>s+1); return; }
    submitAll();
  }

  async function submitAll() {
    setLoading(true);
    try {
      // 1. Create auth account
      const { data: authData, error: authErr } = await sb.auth.signUp({
        email: form.email, password: form.password,
        options: { data: { full_name: form.name, role: 'farmer' } }
      });
      if (authErr) throw authErr;

      // 2. Sign in
      await new Promise(r=>setTimeout(r,1200));
      const { data: signIn, error: signInErr } = await sb.auth.signInWithPassword({ email: form.email, password: form.password });
      if (signInErr) throw signInErr;

      // 3. Create farmer profile
const { error: profileErr } = await (sb as any).from('farmer_profiles').insert({        user_id: signIn.user.id,
        full_name: form.name,
        mobile_number: form.mobile,
        aadhaar_number: form.aadhaar,
        address: [form.address,form.village,form.district,form.state,form.pincode].filter(Boolean).join(', '),
        land_area: parseFloat(form.landArea)||0,
        land_unit: 'acres',
        crop_type: form.cropType,
        bank_name: form.bankName,
        account_number: form.accountNumber,
        ifsc_code: form.ifsc,
        account_holder_name: form.accountHolder||form.name,
      });
      if (profileErr) throw profileErr;

      // 4. Register on blockchain (non-blocking)
      const farmerId = 'QG-' + signIn.user.id.slice(0,8).toUpperCase();
      const { data: newProfile } = await sb
        .from('farmer_profiles')
        .select('id')
        .eq('user_id', signIn.user.id)
        .single();

      if (newProfile) {
        fetch('/api/blockchain/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farmerId,
            name: form.name,
            mobile: form.mobile,
            aadhaarLast4: form.aadhaar.slice(-4),
            profileId: (newProfile as any).id,
          }),
        }).catch(e => console.log('Blockchain registration failed:', e));
      }

      toast.success('Registration complete! Blockchain identity being created...');
      router.push('/dashboard/farmer');
      router.refresh();
    } catch(err:any) {
      toast.error(err?.message??'Registration failed');
    } finally { setLoading(false); }
  }

  const steps = [
    {n:1,label:'Account', icon:'👤',desc:'Login credentials'},
    {n:2,label:'Personal',icon:'📋',desc:'Identity & address'},
    {n:3,label:'Farm',    icon:'🌾',desc:'Land & crop details'},
    {n:4,label:'Bank',   icon:'🏦',desc:'Payment details'},
  ];

  if (!mounted) return null;

  return (<>
    <style dangerouslySetInnerHTML={{__html: STYLES}} />
    <div className="reg-page">

      {/* LEFT */}
      <div className="reg-left">
        <div className="reg-brand">
          <div className="reg-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="20" height="20"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <span className="reg-brand-name">FarmVerify</span>
        </div>
        <div className="reg-left-title">Join FarmVerify<br/>as a <span>Farmer</span> 🌱</div>
        <div className="reg-left-desc">Complete 4 steps to get your blockchain identity and access all government schemes.</div>
        <div className="reg-steps">
          {steps.map(s => {
            const st = step===s.n?'active':step>s.n?'done':'upcoming';
            return (
              <div key={s.n} className={`reg-step ${st}`}>
                <div className={`reg-step-icon ${st}`}>{step>s.n?'✓':s.icon}</div>
                <div><div className="reg-step-name">{s.label}</div><div className="reg-step-desc">{s.desc}</div></div>
              </div>
            );
          })}
        </div>
        <div className="reg-benefits">
          {['Blockchain-verified identity','8+ Government schemes','Instant loan eligibility','QR digital identity card'].map(b=>(
            <div key={b} className="reg-benefit"><div className="reg-bdot"/>{b}</div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="reg-right">
        <div className="reg-form">
          <div className="reg-stepper">
            {steps.map((s,i)=>(
              <div key={s.n} style={{display:'flex',alignItems:'center',flex:i<steps.length-1?1:0}}>
                <div className={`reg-sc ${step>s.n?'done':step===s.n?'cur':'next'}`}>{step>s.n?'✓':s.n}</div>
                {i<steps.length-1 && <div className={`reg-sl ${step>s.n?'done':'next'}`}/>}
              </div>
            ))}
          </div>

          <div className="reg-ftitle">{['👤 Account Details','📋 Personal & Address','🌾 Farm Details','🏦 Bank Details'][step-1]}</div>
          <div className="reg-fsub">{['Step 1 of 4 — Create your login credentials','Step 2 of 4 — Your identity and location','Step 3 of 4 — Tell us about your farmland','Step 4 of 4 — Bank account for direct benefit transfer'][step-1]}</div>

          {step===1 && <div className="g2">
            <div className="gfull"><Field label="Full Name" value={form.name} onChange={set('name')} req ph="e.g. Ramesh Bhosale"/></div>
            <div className="gfull"><Field label="Email Address" value={form.email} onChange={set('email')} req type="email" ph="your@email.com"/></div>
            <Field label="Password" value={form.password} onChange={set('password')} req type="password" ph="Min. 6 characters"/>
            <Field label="Confirm Password" value={form.confirm} onChange={set('confirm')} req type="password" ph="Repeat password"/>
          </div>}

          {step===2 && <div className="g2">
            <Field label="Mobile Number" value={form.mobile} onChange={set('mobile')} req ph="10-digit mobile" max={10}/>
            <Field label="Aadhaar Number" value={form.aadhaar} onChange={set('aadhaar')} req ph="XXXX XXXX XXXX" max={14}/>
            <div className="gfull"><Field label="Full Address" value={form.address} onChange={set('address')} ph="House No, Street, Landmark"/></div>
            <Field label="Village / Town" value={form.village} onChange={set('village')} ph="e.g. Koregaon"/>
            <Field label="District" value={form.district} onChange={set('district')} ph="e.g. Satara"/>
            <Field label="State" value={form.state} onChange={set('state')} opts={['Maharashtra','Karnataka','Punjab','Haryana','Uttar Pradesh','Madhya Pradesh','Andhra Pradesh','Telangana','Rajasthan','Gujarat']}/>
            <Field label="PIN Code" value={form.pincode} onChange={set('pincode')} ph="6-digit PIN" max={6}/>
          </div>}

          {step===3 && <div className="g3">
            <Field label="Land Area (Acres)" value={form.landArea} onChange={set('landArea')} req type="number" ph="e.g. 3.5"/>
            <Field label="Survey / Gat No." value={form.surveyNo} onChange={set('surveyNo')} ph="e.g. 45/A"/>
            <Field label="Crop Type" value={form.cropType} onChange={set('cropType')} opts={['Wheat','Sugarcane','Rice / Paddy','Soybean','Cotton','Onion','Tomato','Grapes','Turmeric','Mixed Crops']}/>
            <Field label="Irrigation" value={form.irrigationType} onChange={set('irrigationType')} opts={['Borewell','Drip Irrigation','Canal / River','Rain-fed','Tank / Pond']}/>
            <Field label="Soil Type" value={form.soilType} onChange={set('soilType')} opts={['Black Cotton Soil','Red Laterite','Alluvial','Sandy Loam','Clay']}/>
            <Field label="Ownership" value={form.ownership} onChange={set('ownership')} opts={['Self-owned','Leased','Inherited']}/>
          </div>}

          {step===4 && <>
            <div className="g2">
              <div className="gfull"><Field label="Bank Name" value={form.bankName} onChange={set('bankName')} ph="e.g. State Bank of India"/></div>
              <div className="gfull"><Field label="Account Holder Name" value={form.accountHolder} onChange={set('accountHolder')} ph="As per bank records"/></div>
              <Field label="Account Number" value={form.accountNumber} onChange={set('accountNumber')} ph="Bank account number"/>
              <Field label="IFSC Code" value={form.ifsc} onChange={set('ifsc')} ph="e.g. SBIN0001234"/>
              <Field label="Monthly Income (₹)" value={form.monthlyIncome} onChange={set('monthlyIncome')} type="number" ph="e.g. 15000"/>
            </div>
            <div className="info-box">
              ✅ Your identity will be registered on <strong>Ethereum Sepolia blockchain</strong>. Contract: 0xAf9a6Eefccd63B77D860BD1d544Fa8F661DF1379. Bank details used only for Direct Benefit Transfer (DBT).
            </div>
          </>}

          <div className="reg-btns">
            {step>1 && <button className="btn-back" onClick={()=>setStep(s=>s-1)}>← Back</button>}
            <button className={`btn-next${step===4?' btn-submit':''}`} onClick={nextStep} disabled={loading}>
              {loading?'⏳ Registering...':step===4?'🚀 Complete Registration':'Next Step →'}
            </button>
          </div>
          <div className="reg-signin">Already registered? <a href="/auth/login">Sign in →</a></div>
        </div>
      </div>
    </div>
  </>);
}

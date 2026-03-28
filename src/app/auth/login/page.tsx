'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const sb = createClient();
  const [email, setEmail] = useState('');
  const [pass, setPass]   = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      const { data: u } = await sb.from('users').select('role').eq('id', data.user.id).single();
      const role = (u as any)?.role ?? 'farmer';
      toast.success('Welcome back!');
      router.push(`/dashboard/${role}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message ?? 'Invalid email or password');
    } finally { setLoading(false); }
  }

  const credentials = [
    { role: 'Admin',     icon: '🛡️', email: 'admin@farmverify.com',     pass: 'Admin@123',     color: '#7c3aed', bg: 'rgba(124,58,237,.08)', border: 'rgba(124,58,237,.2)' },
    { role: 'Validator', icon: '✅', email: 'validator@farmverify.com', pass: 'Validator@123', color: '#d97706', bg: 'rgba(217,119,6,.08)',   border: 'rgba(217,119,6,.2)' },
    { role: 'Farmer',    icon: '🌾', email: 'farmer@farmverify.com',    pass: 'Farmer@123',    color: '#16a34a', bg: 'rgba(22,163,74,.08)',   border: 'rgba(22,163,74,.2)' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&family=Poppins:wght@500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; font-family: 'Nunito', sans-serif; background: #0f1a12; color: #e8f5e9; }

        .page { min-height: 100vh; display: flex; align-items: stretch; }

        /* ── LEFT PANEL ── */
        .left {
          width: 480px; flex-shrink: 0;
          background: linear-gradient(160deg, #0a2e10 0%, #1b5e20 45%, #2e7d32 100%);
          display: flex; flex-direction: column; justify-content: center; align-items: center;
          padding: 48px 40px; position: relative; overflow: hidden;
        }
        .left::before {
          content: ''; position: absolute; inset: 0; opacity: .04;
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E");
        }
        .left-inner { position: relative; width: 100%; max-width: 340px; }
        .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 40px; }
        .brand-icon { width: 48px; height: 48px; background: rgba(255,255,255,.15); border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .brand-name { font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 700; color: white; }
        .left h1 { font-family: 'Poppins', sans-serif; font-size: 30px; font-weight: 700; color: white; line-height: 1.25; margin-bottom: 12px; }
        .left h1 span { color: #86efac; }
        .left p { font-size: 14px; color: rgba(255,255,255,.65); line-height: 1.7; margin-bottom: 36px; }
        .feat-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 40px; width: 100%; }
        .feat-item { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1); border-radius: 10px; padding: 11px 14px; font-size: 13px; color: rgba(255,255,255,.85); }
        .feat-item-icon { font-size: 18px; flex-shrink: 0; }

        /* Credentials hint */
        .demo-hint { background: rgba(0,0,0,.3); border: 1px solid rgba(255,255,255,.08); border-radius: 12px; padding: 16px 18px; width: 100%; }
        .demo-hint-title { font-size: 11px; font-weight: 700; color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: .08em; margin-bottom: 10px; }
        .demo-row { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,.06); }
        .demo-row:last-child { border: none; padding-bottom: 0; }
        .demo-badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; white-space: nowrap; }
        .demo-cred { font-size: 11px; color: rgba(255,255,255,.5); flex: 1; }
        .demo-cred strong { color: rgba(255,255,255,.75); }

        /* ── RIGHT PANEL ── */
        .right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 48px 40px; background: #111b13; }
        .form-box { width: 100%; max-width: 420px; }
        .form-title { font-family: 'Poppins', sans-serif; font-size: 26px; font-weight: 700; color: #f0fdf4; margin-bottom: 4px; }
        .form-sub { font-size: 13.5px; color: #6b7280; margin-bottom: 32px; }
        .field { margin-bottom: 18px; }
        .field label { display: block; font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 7px; }
        .inp { width: 100%; height: 48px; background: #1a2b1c; border: 1.5px solid #2d4a30; border-radius: 10px; padding: 0 14px; font-size: 14px; font-family: 'Nunito', sans-serif; color: #e8f5e9; outline: none; transition: .2s; }
        .inp:focus { border-color: #4ade80; background: #1e3520; box-shadow: 0 0 0 3px rgba(74,222,128,.1); }
        .inp::placeholder { color: #4b5563; }
        .pass-wrap { position: relative; }
        .pass-wrap .inp { padding-right: 46px; }
        .eye-btn { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #6b7280; font-size: 16px; padding: 0; line-height: 1; }
        .eye-btn:hover { color: #9ca3af; }
        .submit-btn { width: 100%; height: 50px; border-radius: 12px; border: none; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Nunito', sans-serif; transition: .2s; margin-top: 8px; letter-spacing: .02em; }
        .submit-btn:hover:not(:disabled) { background: linear-gradient(135deg, #4ade80, #22c55e); box-shadow: 0 6px 24px rgba(34,197,94,.35); transform: translateY(-1px); }
        .submit-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

        /* Quick fill cards */
        .quick-label { font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; letter-spacing: .07em; text-align: center; margin: 22px 0 12px; display: flex; align-items: center; gap: 8px; }
        .quick-label::before, .quick-label::after { content: ''; flex: 1; height: 1px; background: #1e3520; }
        .quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 24px; }
        .quick-card { background: #1a2b1c; border: 1.5px solid #2d4a30; border-radius: 12px; padding: 14px 10px; cursor: pointer; transition: .18s; text-align: center; }
        .quick-card:hover { border-color: #4ade80; background: #1e3520; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.3); }
        .quick-card-icon { font-size: 22px; margin-bottom: 6px; }
        .quick-card-role { font-size: 12px; font-weight: 700; color: #d1fae5; margin-bottom: 3px; }
        .quick-card-email { font-size: 10px; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
        .quick-card-pass { font-size: 10px; color: #4b5563; font-weight: 600; }

        .register-link { text-align: center; font-size: 13px; color: #4b5563; }
        .register-link a { color: #4ade80; font-weight: 700; text-decoration: none; }
        .register-link a:hover { text-decoration: underline; }

        /* ── MOBILE ── */
        @media (max-width: 900px) {
          .page { flex-direction: column; }
          .left { width: 100%; padding: 40px 24px 36px; }
          .left h1 { font-size: 24px; }
          .feat-list { display: none; }
          .demo-hint { display: none; }
          .right { padding: 32px 20px 40px; }
          .quick-card-email { display: none; }
        }
        @media (max-width: 480px) {
          .left { padding: 32px 20px 28px; }
          .left h1 { font-size: 22px; }
          .right { padding: 24px 16px 32px; }
          .form-title { font-size: 22px; }
        }
      `}</style>

      <div className="page">
        {/* ── LEFT ── */}
        <div className="left">
          <div className="left-inner">
            <div className="brand">
              <div className="brand-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="26" height="26">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span className="brand-name">FarmVerify</span>
            </div>
            <h1>Welcome Back,<br/><span>Farmer!</span> 🌾</h1>
            <p>Log in to access your digital identity, government schemes, loan eligibility, and blockchain-verified records.</p>
            <div className="feat-list">
              {[['🔐', 'Blockchain identity protection'],['🏛️', 'Access 8+ government schemes'],['💰', 'Instant loan eligibility check'],['📱', 'QR-based digital identity card'],['📄', 'Secure document storage']].map(([icon, text]) => (
                <div className="feat-item" key={text}>
                  <span className="feat-item-icon">{icon}</span>{text}
                </div>
              ))}
            </div>
            <div className="demo-hint">
              <div className="demo-hint-title">Demo Credentials</div>
              {credentials.map(c => (
                <div className="demo-row" key={c.role}>
                  <span className="demo-badge" style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>{c.icon} {c.role}</span>
                  <span className="demo-cred"><strong>{c.email}</strong> · {c.pass}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="right">
          <div className="form-box">
            <div className="form-title">Sign In</div>
            <div className="form-sub">Enter your credentials to access your dashboard</div>

            <form onSubmit={handleLogin}>
              <div className="field">
                <label>Email Address</label>
                <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required autoComplete="email" />
              </div>
              <div className="field">
                <label>Password</label>
                <div className="pass-wrap">
                  <input className="inp" type={showPass ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)} placeholder="Enter your password" required autoComplete="current-password" />
                  <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>{showPass ? '🙈' : '👁️'}</button>
                </div>
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? '⏳ Signing in...' : '🌾 Sign In to Dashboard'}
              </button>
            </form>

            <div className="quick-label">Quick Login</div>
            <div className="quick-grid">
              {credentials.map(c => (
                <div key={c.role} className="quick-card" onClick={() => { setEmail(c.email); setPass(c.pass); }}
                  style={{ borderColor: email === c.email ? c.color : '#2d4a30' }}>
                  <div className="quick-card-icon">{c.icon}</div>
                  <div className="quick-card-role" style={{ color: c.color }}>{c.role}</div>
                  <div className="quick-card-email">{c.email}</div>
                  <div className="quick-card-pass">{c.pass}</div>
                </div>
              ))}
            </div>

            <div className="register-link">
              New farmer? <a href="/auth/register">Register here →</a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

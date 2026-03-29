import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export default async function PublicFarmerPage({ params }: { params: { id: string } }) {
  
  // Public client — bypasses RLS for read access
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: p } = await supabase
    .from('farmer_profiles')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!p) return notFound();

  const { data: docs } = await supabase
    .from('documents')
    .select('*')
    .eq('farmer_id', p.id)
    .order('created_at', { ascending: false });
  const docList = (docs || []) as any[];

  const { data: vs } = await supabase
    .from('verification_status')
    .select('*')
    .eq('farmer_id', p.id)
    .single();
  const v = vs as any;
  const isApproved = v?.status === 'approved';

  const DOC_ICONS: Record<string, string> = {
    identity: '🪪', land: '🗺️', bank: '🏦',
    crop: '🌾', other: '📄', aadhaar: '🪪',
    photo: '🧑‍🌾', income: '📃', landphoto: '🌾',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Poppins:wght@600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Nunito',sans-serif;background:#f0faf0;min-height:100vh}
        .page{max-width:680px;margin:0 auto;padding:24px 16px 48px}
        .header{background:linear-gradient(135deg,#1b5e20,#2e7d32,#43a047);border-radius:16px;padding:24px;color:white;margin-bottom:20px;position:relative;overflow:hidden}
        .header::before{content:'';position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,.08)}
        .brand{display:flex;align-items:center;gap:8px;margin-bottom:16px;opacity:.85;font-size:13px;font-weight:600}
        .brand-icon{width:28px;height:28px;background:rgba(255,255,255,.2);border-radius:7px;display:flex;align-items:center;justify-content:center}
        .farmer-row{display:flex;align-items:center;gap:14px}
        .avatar{width:56px;height:56px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;border:2px solid rgba(255,255,255,.3);flex-shrink:0;overflow:hidden}
        .farmer-name{font-family:'Poppins',sans-serif;font-size:20px;font-weight:700}
        .farmer-id{font-size:11px;opacity:.7;font-family:monospace;margin-top:2px}
        .verify-badge{display:inline-flex;align-items:center;gap:5px;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;margin-top:8px}
        .verify-badge.approved{background:rgba(74,222,128,.25);border:1px solid rgba(74,222,128,.4)}
        .verify-badge.pending{background:rgba(255,167,38,.2);border:1px solid rgba(255,167,38,.3)}
        .chain-badge{background:rgba(21,101,192,.3);border:1px solid rgba(21,101,192,.5);border-radius:10px;padding:10px 14px;margin-top:14px;font-size:11px;color:rgba(255,255,255,.8);display:flex;align-items:flex-start;gap:8px}
        .chain-hash{font-family:monospace;font-size:10px;color:#90caf9;word-break:break-all;margin-top:3px}
        .card{background:white;border-radius:12px;padding:18px;margin-bottom:14px;border:1px solid #e0e0e0;box-shadow:0 1px 4px rgba(0,0,0,.04)}
        .card-title{font-family:'Poppins',sans-serif;font-size:13px;font-weight:700;color:#1a1a1a;margin-bottom:14px;display:flex;align-items:center;gap:6px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .field{background:#f5faf5;border-radius:8px;padding:10px 12px;border:1px solid #e8f5e9}
        .field-label{font-size:10px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px}
        .field-val{font-size:13px;color:#1a1a1a;font-weight:600}
        .doc-row{display:flex;align-items:center;gap:12px;padding:12px;border-radius:10px;border:1px solid #e0e0e0;background:white;margin-bottom:8px}
        .doc-icon{width:40px;height:40px;border-radius:9px;background:#e8f5e9;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
        .doc-name{font-size:13px;font-weight:600;color:#1a1a1a}
        .doc-type{font-size:10px;color:#6b7280;margin-top:2px;text-transform:uppercase;font-weight:600;letter-spacing:.04em}
        .doc-date{font-size:10px;color:#9ca3af;margin-top:1px}
        .doc-view{margin-left:auto;background:#e8f5e9;color:#2e7d32;border:none;border-radius:7px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer;text-decoration:none;flex-shrink:0;white-space:nowrap}
        .no-docs{text-align:center;padding:32px;color:#9ca3af;font-size:13px}
        .footer{text-align:center;margin-top:24px;font-size:11px;color:#9ca3af;line-height:1.8}
        .footer strong{color:#2e7d32}
        @media(max-width:480px){.grid{grid-template-columns:1fr}}
      `}</style>

      <div className="page">
        <div className="header">
          <div className="brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" width="14" height="14">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            FarmVerify — Verified Farmer Identity
          </div>
          <div className="farmer-row">
            <div className="avatar">
              {(p as any).profile_photo_url
                ? <img src={(p as any).profile_photo_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                : ((p as any).full_name?.charAt(0) || 'F').toUpperCase()
              }
            </div>
            <div>
              <div className="farmer-name">{(p as any).full_name}</div>
              <div className="farmer-id">ID: {String((p as any).id).slice(0,8).toUpperCase()}</div>
              <div className={`verify-badge ${isApproved ? 'approved' : 'pending'}`}>
                {isApproved ? '✓ Identity Verified on Blockchain' : '⏳ Verification Pending'}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">🌾 Farm Information</div>
          <div className="grid">
            {[
              ['Full Name', (p as any).full_name, false],
              ['Mobile', '+91 ' + ((p as any).mobile_number || ''), false],
              ['Crop Type', (p as any).crop_type, false],
              ['Land Area', `${(p as any).land_area} ${(p as any).land_unit}`, false],
              ['Aadhaar', `XXXX XXXX ${String((p as any).aadhaar_number || '').slice(-4)}`, false],
              ['Address', (p as any).address, true],
            ].map(([label, val, full]) => (
              <div key={label as string} className="field" style={full ? {gridColumn:'1/-1'} : {}}>
                <div className="field-label">{label as string}</div>
                <div className="field-val">{(val as string) || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">🏦 Bank Details</div>
          <div className="grid">
            {[
              ['Bank Name', (p as any).bank_name],
              ['Account Holder', (p as any).account_holder_name],
              ['Account No.', `****${String((p as any).account_number || '').slice(-4)}`],
              ['IFSC Code', (p as any).ifsc_code],
            ].map(([label, val]) => (
              <div key={label} className="field">
                <div className="field-label">{label}</div>
                <div className="field-val">{val || '—'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-title">📊 Verification Status</div>
          <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'12px',background:isApproved?'#f0fdf4':'#fff8e1',borderRadius:'10px',border:`1px solid ${isApproved?'#bbf7d0':'#fde68a'}`}}>
            <span style={{fontSize:'28px'}}>{isApproved?'✅':'⏳'}</span>
            <div>
              <div style={{fontWeight:700,color:isApproved?'#16a34a':'#d97706',fontSize:'14px'}}>
                {isApproved ? 'VERIFIED' : (v?.status || 'PENDING').replace('_',' ').toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            📄 Uploaded Documents
            <span style={{marginLeft:'auto',background:'#e8f5e9',color:'#2e7d32',padding:'2px 8px',borderRadius:'10px',fontSize:'11px',fontWeight:700}}>
              {docList.length} doc{docList.length !== 1 ? 's' : ''}
            </span>
          </div>
          {docList.length === 0 ? (
            <div className="no-docs">
              <div style={{fontSize:'32px',marginBottom:'8px'}}>📭</div>
              No documents uploaded yet
            </div>
          ) : (
            docList.map((doc: any) => (
              <div key={doc.id} className="doc-row">
                <div className="doc-icon">{DOC_ICONS[doc.document_type] || '📄'}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div className="doc-name">{doc.document_name}</div>
                  <div className="doc-type">{(doc.document_type || '').replace('_',' ')}</div>
                  <div className="doc-date">Uploaded {new Date(doc.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                </div>
                <a href={doc.file_url} target="_blank" rel="noreferrer" className="doc-view">View →</a>
              </div>
            ))
          )}
        </div>

        <div className="footer">
          <strong>FarmVerify</strong> — Blockchain-Powered Farmer Identity System<br/>
          Verified by an authorized FarmVerify validator.
        </div>
      </div>
    </>
  );
}
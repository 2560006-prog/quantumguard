'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
export default function SignOut() {
  const router = useRouter();
  useEffect(() => { createClient().auth.signOut().then(() => router.push('/auth/login')); }, []);
  return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f5faf5',fontSize:'16px',color:'#2e7d32',fontFamily:'Nunito,sans-serif' }}>Signing out... 🌾</div>;
}

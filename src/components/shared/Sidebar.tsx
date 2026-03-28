'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  Leaf, LayoutDashboard, FileText, Settings,
  LogOut, Users, ShieldCheck, BarChart3, CheckCircle2
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarProps {
  role: UserRole;
  userName: string;
  userEmail: string;
}

const farmerLinks = [
  { href: '/dashboard/farmer', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/farmer/profile', label: 'My Profile', icon: FileText },
  { href: '/dashboard/farmer/documents', label: 'Documents', icon: FileText },
  { href: '/dashboard/farmer/status', label: 'Verification Status', icon: CheckCircle2 },
];

const validatorLinks = [
  { href: '/dashboard/validator', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/validator/farmers', label: 'All Farmers', icon: Users },
  { href: '/dashboard/validator/reviews', label: 'My Reviews', icon: CheckCircle2 },
];

const adminLinks = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/admin/farmers', label: 'All Farmers', icon: Users },
  { href: '/dashboard/admin/validators', label: 'Validators', icon: ShieldCheck },
  { href: '/dashboard/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
];

const roleLinks = { farmer: farmerLinks, validator: validatorLinks, admin: adminLinks };
const roleLabels = { farmer: 'Farmer Portal', validator: 'Validator Portal', admin: 'Admin Portal' };
const roleColors = {
  farmer: 'rgba(34,197,94,0.15)',
  validator: 'rgba(245,158,11,0.15)',
  admin: 'rgba(147,51,234,0.15)'
};
const roleTextColors = { farmer: '#22c55e', validator: '#f59e0b', admin: '#a855f7' };

export default function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const links = roleLinks[role];

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success('Signed out');
    router.push('/auth/login');
  }

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)' }}>
      {/* Logo */}
      <div className="p-5 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <Leaf className="w-5 h-5" style={{ color: '#22c55e' }} />
          </div>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: 'var(--text-primary)' }}>FarmVerify</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{roleLabels[role]}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="section-label px-2">Navigation</p>
        {links.map(link => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}
              className={cn('sidebar-link', isActive && 'active')}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: roleColors[role], color: roleTextColors[role] }}>
            {userName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{userName || 'User'}</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{userEmail}</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="sidebar-link w-full hover:text-red-400">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

'use client';

import { Activity, AlertTriangle, BarChart, Home, LogOut, Megaphone, Settings, Users } from 'lucide-react'
import { Button } from '@/components/ui/button';
import { logout } from '@/lib/auth';
import { useMe } from '@/lib/useMe';
import Loader from '@/components/seraui/Loader';
import { useActiveSection } from './useActiveSection';
import { usePathname } from 'next/navigation';


export const sidebarItems = [
  { href: '/admin?section=dashboard', icon: Home, label: 'Dashboard' },
  { href: '/admin?section=users', icon: Users, label: 'Users' },
  { href: '/admin?section=disputes', icon: AlertTriangle, label: 'Dispute Resolution' },
  { href: '/admin?section=settings', icon: Settings, label: 'Platform Settings' },
  { href: '/admin?section=announcements', icon: Megaphone, label: 'Announcements' },
  { href: '/admin?section=audits', icon: Activity, label: 'Audit Logs' },
];
interface SideBarProps {
  isOpen?: boolean;
  selectedSection?: string;
}

export default function SideBar({ isOpen = true, selectedSection }: SideBarProps) {
  const user = useMe().user;
  const userLoading = useMe().loading;

  const { activeSection, handleActiveSectionChange } = useActiveSection();

  if (userLoading) return <Loader loading={true} />;
  if (!user) return <div>Unauthorized</div>;

  const containerClass = isOpen
    ? 'hidden md:block w-64 bg-card border-r border-border h-screen sticky top-0 transition-all duration-200'
    : 'hidden md:block w-16 bg-card border-r border-border h-screen sticky top-0 transition-all duration-200';

  return (
    <aside className={containerClass}>
      <div className="p-3 border-b border-border flex items-center justify-center">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <BarChart className="h-5 w-5" />
            </div>
            {isOpen && <h1 className="text-xl font-bold">USCOR Admin</h1>}
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = ['dashboard', 'users', 'disputes', 'settings', 'announcements', 'audit'].includes(activeSection) && activeSection === item.label.toLowerCase();
              return (
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => handleActiveSectionChange(item.label.toLowerCase() as any)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {isOpen && <span>{item.label}</span>}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}

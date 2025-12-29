"use client"

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function useActiveSection() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'users' | 'disputes' | 'settings' | 'announcements' | 'audits'>('dashboard');
  const router = useRouter();

  const handleActiveSectionChange = (section: 'dashboard' | 'users' | 'disputes' | 'settings' | 'announcements' | 'audits') => {
    setActiveSection(section);
    router.push(`/admin?section=${section === 'dashboard' ? '' : section}`);
    router.refresh();
  }

  return { activeSection, handleActiveSectionChange };
}
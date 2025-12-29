'use client'
import { useState } from 'react';
import { useMe } from '@/lib/useMe';
import Loader from '@/components/seraui/Loader';
import BusinessSidebar from './business/_components/BusinessSidebar';
import BusinessHeader from './business/_components/BusinessHeader';

export default function ClientSideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading, error } = useMe();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader loading={true} />
    </div>
  )
  if (error || role !== 'business') return <div>Unauthorized</div>;

  return (
    <div className="flex min-h-screen  text-foreground">
      <BusinessSidebar business={user} isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <BusinessHeader business={user} isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen((s) => !s)} />
        <main className='p-2 w-full h-full min-h-0 overflow-x-hidden'>
          {children}
        </main>
      </div>
    </div>
  );
}
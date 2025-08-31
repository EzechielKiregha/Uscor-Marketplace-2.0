'use client'
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

  if (loading) return <Loader loading={true} />;
  if (error || role !== 'business') return <div>Unauthorized</div>;

  return (
    <div className="flex min-h-screen dark:bg-gray-950 text-foreground">
      <BusinessSidebar business={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <BusinessHeader business={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/5">
          {children}
        </main>
      </div>
    </div>
  );
}
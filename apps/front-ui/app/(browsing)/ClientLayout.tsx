'use client'

import HeaderComponent from '@/components/seraui/HeaderComponent';
import Footer from '@/components/seraui/FooterSection';

export default function ClientSideLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderComponent />
        <main className='p-2 w-full h-full min-h-0 overflow-x-hidden'>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
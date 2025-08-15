'use client';

import Footer from '@/components/seraui/FooterSection';
import FreelanceServiceList from './_components/FreelanceServiceList';
import HeaderComponent from '@/components/seraui/HeaderComponent';
import CategoryScrollArea from '@/components/CategoryScrollArea';
import FreelanceHero from './_components/FreelanceHero';

export default function FreelanceGigsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950 text-foreground">
      {/* Header */}
      <HeaderComponent />

      {/* Hero */}
      <FreelanceHero />

      {/* Main Content */}
      <main className="flex-1">
        <div className="">
          <div className="flex">
            {/* Sidebar: Category Scroll Area */}
            <CategoryScrollArea type="freelance" />

            {/* Main: Service List */}
            <div className="flex-1 min-w-0">
              <FreelanceServiceList />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
import Footer from '@/components/seraui/FooterSection';
import HeaderComponent from '@/components/seraui/HeaderComponent';
import IntelligentPOS from '@/components/seraui/IntelligentPOS';

export default function POSPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-950 text-foreground">
      <HeaderComponent />
      <main className="flex-1">
        <IntelligentPOS />
      </main>
      <Footer />
    </div>
  );
}
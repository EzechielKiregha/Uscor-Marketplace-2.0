import IntelligentPOS from '@/components/seraui/IntelligentPOS';

export default function POSPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background  text-foreground">
      <main className="flex-1">
        <IntelligentPOS />
      </main>
    </div>
  );
}
import Footer from "@/components/seraui/FooterSection";
import HardwarePage from "@/components/seraui/HardwarePage";
import HeaderComponent from "@/components/seraui/HeaderComponent";


export default function Page() {
  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-gray-950 text-foreground">
      <HeaderComponent />
      <main className="flex-1">
        <HardwarePage />
      </main>
      <Footer />
    </div>
  );
}
'use client';
import HeaderComponent from "@/components/seraui/HeaderComponent";
import ChatThreadList from "../_components/ChatThreadList";
import Footer from "@/components/seraui/FooterSection";

export default function ChatThreadListPage() {
  return (<div className="flex flex-col min-h-screen bg-background dark:bg-gray-950 text-foreground">
    {/* Header */}
    <HeaderComponent />
    <ChatThreadList participantId="current-user-id" />; {/* Replace with actual user ID from auth */}
    {/* Footer */}
    <Footer />
  </div>
  );
}
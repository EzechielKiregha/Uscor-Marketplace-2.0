'use client';
import HeaderComponent from "@/components/seraui/HeaderComponent";
import Footer from "@/components/seraui/FooterSection";
import ChatThreadList from "@/app/(Client)/_components/ChatThreadList";
import { useMe } from "@/lib/useMe";

export default function ChatThreadListPage() {

  const { user, loading: authLoading } = useMe();

  return (<div className="flex flex-col min-h-screen bg-background  text-foreground">
    {/* Header */}
    <HeaderComponent />
    <ChatThreadList participantId={user?.id || "current-user-id"} />;
    {/* Footer */}
    <Footer />
  </div>
  );
}
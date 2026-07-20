"use client";

import FloatingChat from "@/components/FloatingChat";
import Footer from "@/components/seraui/FooterSection";
import HeaderComponent from "@/components/seraui/HeaderComponent";
import { usePusherNotifications } from "@/hooks/usePusherNotifications";
import { useMe } from "@/lib/useMe";

export default function ClientSideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = useMe();

  // Pusher notifications for clients — order status, disputes
  usePusherNotifications({
    role: "client",
    userId: user?.id,
    enabled: !!user?.id && role === "client",
  });

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderComponent />
        <main className="w-full h-full min-h-0 overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}

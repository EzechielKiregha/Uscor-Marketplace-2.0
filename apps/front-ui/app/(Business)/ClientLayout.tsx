"use client";
import { useState } from "react";
import Loader from "@/components/seraui/Loader";
import { useMe } from "@/lib/useMe";
import BusinessHeader from "./business/_components/BusinessHeader";
import BusinessSidebar from "./business/_components/BusinessSidebar";
import FloatingChat from "@/components/FloatingChat";

export default function ClientSideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role, loading, error } = useMe();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  if (loading) return <Loader loading={true} />;
  if (error || role !== "business") return <div>Unauthorized</div>;

  return (
    <div className="flex min-h-screen  text-foreground">
      <BusinessSidebar business={user} isOpen={isSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <BusinessHeader
          business={user}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((s) => !s)}
        />
        <main className="p-2 w-full h-full min-h-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

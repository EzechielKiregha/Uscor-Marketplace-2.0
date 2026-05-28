"use client";

import {
  Activity,
  AlertTriangle,
  BarChart,
  Home,
  Megaphone,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import Loader from "@/components/seraui/Loader";
import { Button } from "@/components/ui/button";
import { useMe } from "@/lib/useMe";
import { useActiveSection } from "./useActiveSection";

export const sidebarItems = [
  { section: "dashboard", icon: Home, label: "Dashboard" },
  { section: "users", icon: Users, label: "Users" },
  { section: "kyc", icon: ShieldCheck, label: "KYC Verification" },
  { section: "announcements", icon: Megaphone, label: "Announcements" },
  { section: "disputes", icon: AlertTriangle, label: "Dispute Resolution" },
  { section: "audits", icon: Activity, label: "Audit Logs" },
  { section: "settings", icon: Settings, label: "Platform Settings" },
];
interface SideBarProps {
  isOpen?: boolean;
  selectedSection?: string;
}

export default function SideBar({
  isOpen = true,
  selectedSection,
}: SideBarProps) {
  const user = useMe().user;
  const userLoading = useMe().loading;

  const { activeSection, handleActiveSectionChange } = useActiveSection();

  if (userLoading) return <Loader loading={true} />;
  if (!user) return <div>Unauthorized</div>;

  const containerClass = isOpen
    ? "hidden md:block w-64 bg-card border-r border-border h-screen sticky top-0 transition-all duration-200"
    : "hidden md:block w-16 bg-card border-r border-border h-screen sticky top-0 transition-all duration-200";

  return (
    <aside className={containerClass}>
      <div className="p-3 border-b border-border flex items-center justify-center">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <BarChart className="h-5 w-5" />
            </div>
            {isOpen && <h1 className="text-xl font-bold">USCOR Admin</h1>}
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive =
                [
                  "dashboard",
                  "users",
                  "kyc",
                  "disputes",
                  "settings",
                  "announcements",
                  "audit",
                ].includes(activeSection) &&
                activeSection === item.section.toLowerCase();
              return (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  key={item.section}
                  onClick={() =>
                    handleActiveSectionChange(item.section.toLowerCase() as any)
                  }
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {isOpen && <span>{item.label}</span>}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}

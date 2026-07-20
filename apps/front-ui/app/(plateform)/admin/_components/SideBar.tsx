"use client";

import {
  Activity,
  AlertTriangle,
  Banknote,
  BarChart,
  Building2,
  ClipboardList,
  Coins,
  Home,
  Megaphone,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useActiveSection } from "./useActiveSection";

export const sidebarItems = [
  { section: "dashboard", icon: Home, label: "Dashboard" },
  { section: "users", icon: Users, label: "Users" },
  { section: "businesses", icon: Building2, label: "Businesses" },
  { section: "workers", icon: Wrench, label: "Workers" },
  { section: "kyc", icon: ShieldCheck, label: "KYC Verification" },
  { section: "tokens", icon: Coins, label: "Tokens & Wallets" },
  { section: "orders", icon: ClipboardList, label: "Order Fulfillment" },
  { section: "announcements", icon: Megaphone, label: "Announcements" },
  { section: "settlements", icon: Banknote, label: "Settlements" },
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
  const { activeSection, handleActiveSectionChange } = useActiveSection();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-card border-r border-border h-screen sticky top-0 transition-all duration-200 overflow-y-auto",
        isOpen ? "w-64" : "w-16",
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border flex items-center gap-2.5">
        <Image alt="logo" src="/logo.png" width={32} height={32} className="rounded-md shrink-0" />
        {isOpen && <span className="font-bold text-foreground tracking-tight">USCOR Admin</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5">
        {sidebarItems.map((item) => {
          const isActive = activeSection === item.section.toLowerCase();
          return (
            <button
              type="button"
              key={item.section}
              className={cn(
                "flex items-center rounded-md text-sm transition-colors w-full",
                isOpen ? "px-3 py-2 gap-2.5" : "flex-col py-2.5 gap-1 justify-center",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
              onClick={() => handleActiveSectionChange(item.section.toLowerCase() as any)}
            >
              <item.icon className={cn("shrink-0", isOpen ? "w-4 h-4" : "w-5 h-5")} />
              {isOpen && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

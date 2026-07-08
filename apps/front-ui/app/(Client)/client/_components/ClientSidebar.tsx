"use client";

import {
  Home,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  User,
  Wallet,
  Wallet2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ClientSection, useClientPanel } from "../../ClientPanelContext";

const clientSideLinks: {
  section: ClientSection;
  icon: any;
  label: string;
}[] = [
  { section: "profile", icon: User, label: "Profile" },
  { section: "orders", icon: ShoppingBag, label: "Order History" },
  { section: "chat", icon: MessageSquare, label: "My Chats" },
  { section: "loyalty", icon: Star, label: "Loyalty Program" },
  { section: "recommendations", icon: Home, label: "Recommendations" },
  { section: "reviews", icon: MessageSquare, label: "Reviews" },
  { section: "wallet", icon: Wallet2, label: "Uscor Wallet" },
  { section: "settings", icon: Settings, label: "Account Settings" },
];

export default function ClientSidebar() {
  const { activeSection, setActiveSection, isSidebarOpen, setIsSidebarOpen } =
    useClientPanel();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-40 w-64 bg-card border-r border-orange-500/60",
          "transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-4 space-y-1">
            {clientSideLinks.map((item) => {
              const isActive = activeSection === item.section;
              const Icon = item.icon;

              return (
                <Button
                  key={item.section}
                  variant="ghost"
                  className={cn(
                    "flex justify-start border-b-0 border-orange-700 w-full px-4 py-2 gap-1.5 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground",
                  )}
                  onClick={() => {
                    setActiveSection(item.section);
                    setIsSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-orange-500/60 space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => {
                setActiveSection("wallet");
                setIsSidebarOpen(false);
              }}
            >
              <Wallet className="h-3 w-3 mr-2" />
              My Wallet
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() => (window.location.href = "/marketplace")}
            >
              <ShoppingBag className="h-3 w-3 mr-2" />
              Browse Marketplace
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
              onClick={() =>
                (window.location.href = "/all-businesses?verified=true")
              }
            >
              <ShieldCheck className="h-3 w-3 mr-2" />
              Verified Businesses
            </Button>
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}

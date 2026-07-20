"use client";

import { useQuery } from "@apollo/client";
import {
    Banknote,
    BarChart,
    BarChart3,
    BriefcaseBusiness,
    Building,
    Crown,
    Handshake,
    MessageSquare,
    Package,
    Settings,
    ShoppingCart,
    Star,
    Users,
    Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GET_UNREAD_COUNT } from "@/graphql/chat.gql";
import { cn } from "@/lib/utils";

interface BusinessSidebarProps {
  business: any;
  isOpen?: boolean;
}

export const sidebarItems = [
  { href: "/business/dashboard", icon: BarChart, label: "Dashboard" },
  { href: "/business/stores", icon: Building, label: "Stores" },
  { href: "/business/inventory", icon: Package, label: "Inventory" },
  { href: "/business/products", icon: Package, label: "Products" },
  { href: "/business/dashboard/orders", icon: ShoppingCart, label: "Orders" },
  {
    href: "/business/freelance-services",
    icon: BriefcaseBusiness,
    label: "Services",
  },
  {
    href: "/business/dashboard/chats",
    icon: MessageSquare,
    label: "Messages",
    badge: true,
  },
  { href: "/business/b2b", icon: Handshake, label: "B2B Hub" },
  { href: "/business/reports", icon: BarChart3, label: "Reports" },
  { href: "/business/customers", icon: Users, label: "Customers" },
  { href: "/business/reposts", icon: Star, label: "Reposts & Reowns" },
  { href: "/business/loyalty", icon: Star, label: "Loyalty Program" },
  { href: "/business/wallet", icon: Wallet, label: "Business Wallet" },
  { href: "/business/settlements", icon: Banknote, label: "Settlements" },
  { href: "/business/subscription", icon: Crown, label: "Subscription" },
  { href: "/business/settings", icon: Settings, label: "Settings" },
];

export default function BusinessSidebar({
  business,
  isOpen = true,
}: BusinessSidebarProps) {
  const pathname = usePathname();
  const [count, setCount] = useState<number>(0);

  const { data: unreadMessages } = useQuery(GET_UNREAD_COUNT, {
    variables: {
      userId: business.id,
    },
  });

  useEffect(() => {
    if (unreadMessages) {
      setCount(unreadMessages.unreadChatCount.totalUnread);
    }
  }, [unreadMessages]);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-card border-r border-border h-screen sticky top-0 transition-all duration-200 overflow-y-auto",
        isOpen ? "w-64" : "w-16",
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        {business.avatar ? (
          <img
            src={business.avatar}
            alt={business.name}
            className={cn("rounded-full object-cover shrink-0", isOpen ? "w-9 h-9" : "w-8 h-8")}
          />
        ) : (
          <div
            className={cn(
              "rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0",
              isOpen ? "w-9 h-9 text-sm" : "w-8 h-8 text-xs",
            )}
          >
            {business.name?.charAt(0)}
          </div>
        )}
        {isOpen && (
          <div className="min-w-0">
            <h2 className="font-semibold text-sm text-foreground truncate">
              {business.name}
            </h2>
            <p className="text-xs text-muted-foreground">Business</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md text-sm transition-colors",
                isOpen ? "px-3 py-2 gap-2.5" : "flex-col py-2.5 gap-1 justify-center",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <item.icon className={cn("shrink-0", isOpen ? "w-4 h-4" : "w-5 h-5")} />
              {isOpen && <span className="truncate">{item.label}</span>}
              {item.badge && count > 0 && (
                <span
                  className={cn(
                    "bg-primary text-primary-foreground text-[10px] font-medium rounded-full px-1.5 py-0.5",
                    isOpen ? "ml-auto" : "mt-0.5",
                  )}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

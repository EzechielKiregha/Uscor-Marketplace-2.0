"use client";

import {
  ChevronDown,
  ChevronUp,
  Gauge,
  Home,
  LogOut,
  Moon,
  ShoppingBag,
  ShoppingCart,
  Store,
  Sun,
  Wallet,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useCart } from "@/app/context/use-cart";
import { BUSINESS_TYPE_LIST } from "@/config/business-types";
import { logout } from "@/lib/auth";
import { BusinessEntity, ClientEntity, WorkerEntity } from "@/lib/types";
import { useMe } from "@/lib/useMe";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MobileNavDrawer({
  open,
  onOpenChange,
}: MobileNavDrawerProps) {
  const { theme, setTheme } = useTheme();
  const { user, role, loading } = useMe();
  const { getItemCount } = useCart();
  const [showBusinessTypes, setShowBusinessTypes] = useState(false);

  // Derive user info
  let displayName = "Guest";
  let email = "";
  let avatar: string | undefined;

  if (user) {
    if (role === "client") {
      displayName = (user as ClientEntity).fullName || (user as ClientEntity).username || "Client";
      email = (user as ClientEntity).email || "";
    } else if (role === "business") {
      displayName = (user as BusinessEntity).name;
      email = (user as BusinessEntity).email || "";
      avatar = (user as BusinessEntity).avatar || undefined;
    } else if (role === "worker") {
      displayName = (user as WorkerEntity).fullName || "Worker";
      email = (user as WorkerEntity).email || "";
      avatar = (user as WorkerEntity).avatar || undefined;
    }
  }

  const getDashboardLink = () => {
    switch (role) {
      case "client": return "/client";
      case "business": return "/business/dashboard";
      case "worker": return "/worker";
      case "admin": return "/admin";
      default: return "/";
    }
  };

  const getDashboardLabel = () => {
    switch (role) {
      case "client": return "My Orders";
      case "business": return "Dashboard";
      case "worker": return "POS Terminal";
      case "admin": return "Admin Panel";
      default: return "Dashboard";
    }
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { href: "/all-businesses", label: "Businesses", icon: Store },
    { href: "/hardware", label: "Hardware", icon: Wrench },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col">
        <SheetHeader className="p-4 pb-3 border-b border-border">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {/* User info */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center overflow-hidden shrink-0">
                {avatar ? (
                  <img src={avatar} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-orange-600 font-semibold text-sm">
                    {displayName[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
                <span className="text-xs text-orange-600 capitalize">{role}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-lg">?</span>
              </div>
              <div>
                <p className="font-semibold text-sm">Welcome</p>
                <SheetClose asChild>
                  <Link href="/login" className="text-xs text-orange-600 hover:underline">
                    Sign in to your account
                  </Link>
                </SheetClose>
              </div>
            </div>
          )}
        </SheetHeader>

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-2">
          {/* Main links */}
          <div className="px-2 space-y-0.5">
            {navLinks.map((link) => (
              <SheetClose key={link.href} asChild>
                <Link
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 transition-colors"
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              </SheetClose>
            ))}

            {/* Cart */}
            <SheetClose asChild>
              <Link
                href="/marketplace/checkout"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 transition-colors"
              >
                <ShoppingCart className="h-4 w-4 shrink-0" />
                Cart
                {getItemCount() > 0 && (
                  <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {getItemCount()}
                  </span>
                )}
              </Link>
            </SheetClose>
          </div>

          {/* Divider */}
          <div className="my-3 mx-4 h-px bg-border" />

          {/* Browse by Business Type */}
          <div className="px-2">
            <button
              onClick={() => setShowBusinessTypes(!showBusinessTypes)}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
            >
              <span>Browse by Type</span>
              {showBusinessTypes ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {showBusinessTypes && (
              <div className="ml-2 space-y-0.5 mt-1">
                {BUSINESS_TYPE_LIST.map((bt) => {
                  const Icon = bt.icon;
                  return (
                    <SheetClose key={bt.key} asChild>
                      <Link
                        href={`/marketplace?businessType=${bt.key}`}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 transition-colors"
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {bt.label}
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-3 mx-4 h-px bg-border" />

          {/* Role-based links */}
          {user && (
            <div className="px-2 space-y-0.5">
              <SheetClose asChild>
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 transition-colors"
                >
                  <Gauge className="h-4 w-4 shrink-0" />
                  {getDashboardLabel()}
                </Link>
              </SheetClose>

              {(role === "client" || role === "business") && (
                <SheetClose asChild>
                  <Link
                    href={role === "client" ? "/client/wallet" : "/business/wallet"}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 transition-colors"
                  >
                    <Wallet className="h-4 w-4 shrink-0" />
                    Wallet
                  </Link>
                </SheetClose>
              )}
            </div>
          )}
        </nav>

        {/* Bottom: theme toggle + sign out */}
        <div className="border-t border-border p-3 space-y-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-3">
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          {/* Sign out */}
          {user && (
            <button
              onClick={() => { logout(); onOpenChange(false); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

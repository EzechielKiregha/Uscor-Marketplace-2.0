"use client";

import { DollarSign, Gauge, LogOutIcon, UserIcon, Wallet } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { logout } from "@/lib/auth";
import { BusinessEntity, ClientEntity, WorkerEntity } from "@/lib/types";
import { useMe } from "@/lib/useMe";
import { Button } from "../ui/button";

export default function UserDropdown() {
  const { user, role, loading } = useMe();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Button
        asChild
        size="sm"
        className="rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4"
      >
        <a href="/login">Sign In</a>
      </Button>
    );
  }

  let displayName: string;
  let avatar: string | undefined;
  if (role === "client") {
    displayName =
      (user as ClientEntity).fullName ||
      (user as ClientEntity).username ||
      "Client";
    avatar = undefined;
  } else if (role === "business") {
    displayName = (user as BusinessEntity).name;
    avatar = (user as BusinessEntity).avatar || undefined;
  } else {
    displayName = (user as WorkerEntity).fullName || "Worker";
    avatar = (user as WorkerEntity).avatar || undefined;
  }

  const initials = displayName[0]?.toUpperCase() || "U";

  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";

  const getDashboardLink = () => {
    switch (role) {
      case "client": return "/client";
      case "business": return "/business/dashboard";
      case "worker": return "/worker";
      case "admin": return pathname === "/admin" ? "/" : "/admin";
      default: return "/";
    }
  };

  const getWalletLink = () => {
    switch (role) {
      case "client": return "/client/wallet";
      case "business": return "/business/wallet";
      default: return "/";
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case "admin": return "Administrator";
      case "business": return "Business Owner";
      case "client": return "Client";
      case "worker": return "Worker";
      default: return "User";
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-800">
          {avatar ? (
            <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
              {initials}
            </span>
          )}
        </div>
        <span className="hidden xl:block text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
          {displayName}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-card border border-border rounded-xl shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden z-50 animate-fade-in">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-border bg-muted/50">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {getRoleLabel()}
            </p>
            {role === "client" && (user as ClientEntity).loyaltyTier && (
              <span className="inline-block text-xs text-orange-600 dark:text-orange-400 font-medium mt-1">
                {(user as ClientEntity).loyaltyTier} · {(user as ClientEntity).loyaltyPoints} pts
              </span>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <Link
              href={getDashboardLink()}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <Gauge className="w-4 h-4 opacity-60" />
              {pathname === "/admin" ? "Home Page" : "Dashboard"}
            </Link>

            {(role === "client" || role === "business") && (
              <Link
                href={getWalletLink()}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <Wallet className="w-4 h-4 opacity-60" />
                Wallet
              </Link>
            )}

            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              <DollarSign className="w-4 h-4 opacity-60" />
              Pricing
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 dark:border-gray-800 py-1.5">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOutIcon className="w-4 h-4 opacity-60" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

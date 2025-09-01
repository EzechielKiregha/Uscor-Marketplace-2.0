"use client"

import { BusinessEntity, ClientEntity, WorkerEntity } from "@/lib/types";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from './PopOver';
import { useMe } from "@/lib/useMe";
import Link from "next/link";
import { logout } from "@/lib/auth";
import { DollarSign, Settings } from "lucide-react";

export default function UserDropdown() {
  const { user, role, loading, error } = useMe();

  if (loading) return <div className="w-5 h-5 bg-orange-600 rounded animate-spin"></div>;

  if (!user) {
    console.warn('No user data found');
    return (
      <Button asChild variant="ghost" size="sm" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
        <a href="/login">Sign In</a>
      </Button>
    );
  }

  // Determine display name and avatar
  let displayName: string;
  let avatar: string | undefined;
  if (role === 'client') {
    displayName = (user as ClientEntity).fullName || (user as ClientEntity).username || 'Client';
    avatar = `https://placehold.co/300x300/E2E8F0/333333?text=${encodeURIComponent(displayName[0])}`; // ClientEntity lacks avatar
  } else if (role === 'business') {
    displayName = (user as BusinessEntity).name;
    avatar = (user as BusinessEntity).avatar || `https://placehold.co/300x300/E2E8F0/333333?text=${encodeURIComponent(displayName[0])}`;
  } else {
    displayName = (user as WorkerEntity).fullName || 'Worker';
    avatar = `https://placehold.co/300x300/E2E8F0/333333?text=${encodeURIComponent(displayName[0])}`; // WorkerEntity lacks avatar
  }

  const getDashboardLink = () => {
    switch (role) {
      case 'client': return '/client/dashboard';
      case 'business': return '/business/dashboard';
      case 'worker': return '/worker/dashboard';
      default: return '/';
    }
  };

  return (
    <Popover>
      <PopoverTrigger>
        <div className="flex items-center  hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-lg transition-colors cursor-pointer">
          <img
            src={avatar}
            alt="User avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
          />
          <span className="text-sm sm:hidden lg:block font-medium text-gray-700 dark:text-gray-200 hidden">
            {displayName}
          </span>
          <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full hidden sm:block">
            125 pts
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent align="end" className="p-0 w-56">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">125 loyalty points</p>
        </div>
        <div className="py-1">
          <Link
            href={getDashboardLink()}
            className="flex items-center px-4 py-2 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]"
          >
            <UserIcon className="w-4 h-4 mr-3 opacity-70" />
            Dashboard
          </Link>
          <Link
            href="/settings"
            className="flex items-center px-4 py-2 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]"
          >
            <Settings className="w-4 h-4 mr-3 opacity-70" />
            Settings
          </Link>
          <Link
            href="/pricing"
            className="flex items-center px-4 py-2 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]"
          >
            <DollarSign className="w-4 h-4 mr-3 opacity-70" />
            Pricing
          </Link>
          <button
            onClick={logout}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOutIcon className="w-4 h-4 mr-3 opacity-70" />
            Logout
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// --- Add Icons ---
const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogOutIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
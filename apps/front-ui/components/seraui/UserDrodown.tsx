"use client"

import { BusinessEntity, ClientEntity, WorkerEntity } from "@/lib/types";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from './PopOver';
import { useMe } from "@/lib/useMe";
import Link from "next/link";
import { logout } from "@/lib/auth";
import { DollarSign, LogOutIcon, Settings, UserIcon } from "lucide-react";

export default function UserDropdown() {
  const { user, role, loading, error } = useMe();

  if (loading) return <div className="w-5 h-5 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>;

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

  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const getDashboardLink = () => {
    switch (role) {
      case 'client': return '/client';
      case 'business': return '/business/dashboard';
      case 'worker': return '/worker/dashboard';
      case 'admin': {
        return pathname === '/admin' ? '/' : '/admin';
      };
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
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-card">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{role}</p>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">{role === 'admin' ? 'Administrator' : role === 'business' ? 'Business Owner' : role === 'client' ? 'Client' : 'Worker'}</p>
        </div>
        <div className="py-1">
          <Link
            href={getDashboardLink()}
            className="flex items-center px-4 py-2 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]"
          >
            {pathname === '/admin' ? (
              <>
                <UserIcon className="w-4 h-4 mr-3 opacity-70" />
                Home Page
              </>
            ) : (
              <>
                <UserIcon className="w-4 h-4 mr-3 opacity-70" />
                Dashboard
              </>
            )}
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
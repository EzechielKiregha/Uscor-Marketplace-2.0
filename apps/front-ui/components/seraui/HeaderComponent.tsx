'use client';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { useState, useId, useRef, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMe } from '@/lib/useMe';
import { logout } from '@/lib/auth';
import { BusinessEntity, ClientEntity, WorkerEntity } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './PopOver';
import {
  ShoppingCart,
  Coffee,
  UtensilsCrossed,
  Shirt,
  Wine,
  Store,
  Hammer,
  Palette,
  Wrench,
  Plug,
  Car,
  BookOpen,
  GraduationCap,
  Brush,
  Layout,
  PenTool,
  Languages,
  Lightbulb,
  Briefcase,
  ChevronDown,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { Button } from '../ui/button';
import Cart from '../Cart';
import { Separator } from '../ui/separator';
// Type definitions
interface SearchIconProps {
  size?: number;
}

interface InputProps {
  className?: string;
  id?: string;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
}

interface NavigationMenuProps {
  children: ReactNode;
  className?: string;
}

interface NavigationMenuListProps {
  children: ReactNode;
  className?: string;
}

interface NavigationMenuItemProps {
  children: ReactNode;
  className?: string;
  role?: string;
  'aria-hidden'?: boolean;
  key?: number;
}

interface NavigationMenuLinkProps {
  href: string | undefined;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
}

// Helper components
const SunIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const SearchIcon: React.FC<SearchIconProps> = ({ size = 16, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MenuIcon: React.FC = () => (
  <svg
    className="pointer-events-none"
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 12L20 12"
      className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
    />
    <path
      d="M4 12H20"
      className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
    />
    <path
      d="M4 12H20"
      className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
    />
  </svg>
);

const Logo: React.FC = () => {
  const path = usePathname()
  return (
    <div className="flex items-center justify-center gap-1">
      <Image alt='logo' src='/logo.png' width={50} height={40} />
      <span className="font-bold sm:text-lg tracking-wider text-primary text-2xl ">Uscor {' '}
        {path.includes('/marketplace') ? (
          <span className='hidden font-bold lg:block'>
            MarketPlace
          </span>
        ) : path.includes('/freelance-gigs') ? (
          <span className='hidden font-bold lg:block'>
            Freelance / Jobs
          </span>
        ) : path.includes('/') && (
          <span className='hidden font-bold lg:block'>
            Intelligent POS
          </span>
        )}
      </span>
    </div>
  );
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => (
  <input
    className={`form-field flex h-9 sm:h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

const NavigationMenu: React.FC<NavigationMenuProps> = ({ children, className = '' }) => <nav className={`relative z-10 ${className}`}>{children}</nav>;
const NavigationMenuList: React.FC<NavigationMenuListProps> = ({ children, className = '' }) => <ul className={`flex items-center ${className}`}>{children}</ul>;
const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({ children, className = '', ...props }) => <li className={`list-none ${className}`} {...props}>{children}</li>;
const NavigationMenuLink: React.FC<NavigationMenuLinkProps> = ({ href, className = '', children, target, rel }) => (
  <a href={href} className={`block transition-colors ${className}`} target={target} rel={rel}>
    {children}
  </a>
);



// ✅ Main business types for navigation
export const businessTypes = [
  { href: '/business-types/artisan', label: 'Artisan & Handcrafted Goods', icon: Palette },
  { href: '/business-types/bookstore', label: 'Bookstore & Stationery', icon: BookOpen },
  { href: '/business-types/electronics', label: 'Electronics & Gadgets', icon: Plug },
  { href: '/business-types/hardware', label: 'Hardware & Tools', icon: Hammer },
  { href: '/business-types/grocery', label: 'Grocery & Convenience', icon: ShoppingCart },
  { href: '/business-types/cafe', label: 'Café & Coffee Shops', icon: Coffee },
  { href: '/business-types/restaurant', label: 'Restaurant & Dining', icon: UtensilsCrossed },
  { href: '/business-types/retail', label: 'Retail & General Stores', icon: Store },
  { href: '/business-types/bar', label: 'Bar & Pub', icon: Wine },
  { href: '/business-types/clothing', label: 'Clothing & Accessories', icon: Shirt },
];

function HeaderComponent() {
  const id = useId();
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Define navigation links based on pathname
  const navLinks = [
    { href: '/uscor-features', label: 'Features', target: '_blank', rel: 'noopener noreferrer' },
    { href: '/hardware', label: 'Hardware', target: '_blank', rel: 'noopener noreferrer' },
    { href: '#', label: 'Business types', isPopover: true, popoverItems: businessTypes },
    { href: '/marketplace', label: 'Marketplace', target: '_blank', rel: 'noopener noreferrer' },
    { href: '/freelance-gigs', label: 'Freelance', target: '_blank', rel: 'noopener noreferrer' },
    { href: '/help', label: 'FAQ', target: '_blank', rel: 'noopener noreferrer' },
  ];

  const UserDropdown = () => {
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
              <UserIcon className="w-4 h-4 mr-3 opacity-70" />
              Settings
            </Link>
            <Link
              href="/pricing"
              className="flex items-center px-4 py-2 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]"
            >
              <UserIcon className="w-4 h-4 mr-3 opacity-70" />
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

  return (
    <header className="border-b border-orange-400/60 dark:border-orange-500/70 bg-white dark:bg-gray-950 w-full sticky top-0 z-50">
      {/* Mobile Search View */}
      {isMobileSearchVisible && (
        <div className="flex h-14 sm:h-16 items-center  lg:hidden px-4">
          <div className="relative flex-1">
            <Input
              id={id + "-mobile-search"}
              className="form-field h-9 pl-9 pr-2 w-full"
              placeholder="Search product..."
              type="search"
              autoFocus
            />
            <div className="text-orange-400/60 dark:text-orange-500/70 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3">
              <SearchIcon size={16} />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsMobileSearchVisible(false)}>
            Cancel
          </Button>
        </div>
      )}


      {/* Default Header View */}
      <div className={`flex h-14 sm:h-16 items-center justify-between gap-4 px-4 lg:px-6 ${isMobileSearchVisible ? 'hidden' : 'flex'}`}>
        {/* Left side: Mobile Menu, Logo, Desktop Nav */}
        <div className="flex items-center  sm:gap-4">
          <div className="lg:hidden">
            <Popover>
              <PopoverTrigger>
                <Button className="group h-8 w-8 hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border hover:border-orange-400/40 dark:hover:border-orange-500/40 transition-all duration-300 ease-out" variant="ghost" size="icon">
                  <MenuIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-48 p-1">
                <NavigationMenu className="max-w-none *:w-full">
                  <NavigationMenuList className="flex-col items-start gap-0">
                    {navLinks.map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full">
                        {link.isPopover ? (
                          <Popover>
                            <PopoverTrigger>
                              <Button variant="ghost" className="cursor-pointer py-2 px-3 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]">
                                <span>{link.label}</span>
                                <ChevronDown size={16} />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-48 p-1">
                              <NavigationMenuList className="flex-col items-start gap-0">
                                {link.popoverItems?.map((item, i) => (
                                  <NavigationMenuItem key={i} className="w-full">
                                    <NavigationMenuLink href={item.href} className="flex py-2 px-3 gap-1 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]">
                                      <item.icon size={18} className="text-primary" />
                                      {item.label}
                                    </NavigationMenuLink>
                                  </NavigationMenuItem>
                                ))}
                              </NavigationMenuList>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <NavigationMenuLink href={link.href} target={link.target} rel={link.rel} className="">
                            <Button variant="link" className='flex cursor-pointer text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 py-1 font-medium transition-colors'>
                              {link.label}
                              {link.target === '_blank' && <ArrowUpRight size={16} className="opacity-70" />}
                            </Button>
                          </NavigationMenuLink>
                        )}
                      </NavigationMenuItem>
                    )
                    )}
                    <NavigationMenuItem className="w-full" role="presentation" aria-hidden={true}>
                      <div role="separator" aria-orientation="horizontal" className="bg-background dark:bg-gray-950/20  -mx-1 my-1 h-px"></div>
                    </NavigationMenuItem>
                    <NavigationMenuItem className="w-full">
                      <Button
                        onClick={toggleTheme}
                        variant="ghost" size="sm" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                        aria-label="Toggle theme"
                      >
                        {theme === 'dark' ? (
                          <SunIcon className="h-5 w-5" />
                        ) : (
                          <MoonIcon className="h-5 w-5" />
                        )}
                      </Button>
                    </NavigationMenuItem>
                    <NavigationMenuItem className="w-full">
                      <NavigationMenuItem className="w-full">
                        <div className="py-2 px-3">
                          <UserDropdown />
                        </div>
                      </NavigationMenuItem>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
          </div>
          <Link href="/" className="text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            <Logo />
          </Link>
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="">
              {navLinks.map((link, index) => (
                <NavigationMenuItem key={index} className="">
                  {link.isPopover ? (
                    <Popover>
                      <PopoverTrigger>
                        <Button variant="ghost" className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 py-1 font-medium transition-colors">
                          <span>{link.label}</span>
                          <ChevronDown size={16} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-48 p-1">
                        <NavigationMenuList className="flex-col items-start gap-0">
                          {link.popoverItems?.map((item, i) => (
                            <NavigationMenuItem key={i} className="w-full">
                              <NavigationMenuLink href={item.href} className="flex py-2 gap-1 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]">
                                <item.icon size={18} className="text-primary" />
                                {item.label}
                              </NavigationMenuLink>
                            </NavigationMenuItem>
                          ))}
                        </NavigationMenuList>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <NavigationMenuLink href={link.href} target={link.target} rel={link.rel} className="">
                      <Button variant="link" className='flex cursor-pointer text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 py-1 font-medium transition-colors'>
                        {link.label}
                        {link.target === '_blank' && <ArrowUpRight size={16} className="opacity-70" />}
                      </Button>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side: Search, Theme Toggle, and Sign In */}
        <div className="flex items-center gap-2">
          <div className="relative hidden lg:hidden">
            <Input id={id} className="form-field h-9 pl-9 pr-2 w-64" placeholder="Search Product..." type="search" />
            <div className="text-orange-400/60 dark:text-orange-500/70 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3">
              <SearchIcon size={16} />
            </div>
          </div>
          <div className=" items-center lg:flex md:hidden hidden gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSearchVisible(true)}>
              <SearchIcon size={18} />
            </Button>

          </div>
          <div className="flex items-center lg:hidden gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMobileSearchVisible(true)}>
              <SearchIcon size={18} />
            </Button>
            <Cart />
            <UserDropdown />
          </div>
          <div className="hidden lg:flex">
            <Button
              onClick={toggleTheme}
              variant="ghost" size="sm" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            <Cart />
            <UserDropdown />

          </div>
        </div>
      </div>
      {isSearchVisible && (
        <div className="flex h-14 sm:h-16 items-center gap-2 px-4">
          <div className="relative flex-1">
            <Input
              id={id + "-mobile-search"}
              className="form-field h-9 pl-9 pr-2 w-full"
              placeholder="Search product..."
              type="search"
              autoFocus
            />
            <div className="text-orange-400/60 dark:text-orange-500/70 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3">
              <SearchIcon size={16} />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsSearchVisible(false)}>
            Cancel
          </Button>
        </div>
      )}
    </header>
  );
}

export default HeaderComponent;
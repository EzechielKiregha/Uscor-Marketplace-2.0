'use client';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { useState, useId, useRef, useEffect, ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Search,
  MenuIcon,
  SunIcon,
  MoonIcon,
} from "lucide-react";
import { Button } from '../ui/button';
import Cart from '../Cart';
import UserDropdown from './UserDrodown';
import NotificationsPopover from './Notifications';
import SearchModal from '@/app/(browsing)/marketplace/_components/SearchModal';
import { Logo } from '../icons/Logos';
// Type definitions

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
  { href: '/signup?businessType=artisan', label: 'Artisan & Handcrafted Goods', icon: Palette },
  { href: '/signup?businessType=bookstore', label: 'Bookstore & Stationery', icon: BookOpen },
  { href: '/signup?businessType=electronics', label: 'Electronics & Gadgets', icon: Plug },
  { href: '/signup?businessType=hardware', label: 'Hardware & Tools', icon: Hammer },
  { href: '/signup?businessType=grocery', label: 'Grocery & Convenience', icon: ShoppingCart },
  { href: '/signup?businessType=cafe', label: 'Café & Coffee Shops', icon: Coffee },
  { href: '/signup?businessType=restaurant', label: 'Restaurant & Dining', icon: UtensilsCrossed },
  { href: '/signup?businessType=retail', label: 'Retail & General Stores', icon: Store },
  { href: '/signup?businessType=bar', label: 'Bar & Pub', icon: Wine },
  { href: '/signup?businessType=clothing', label: 'Clothing & Accessories', icon: Shirt },
];

// Constants for search input configuration
const SEARCH_INPUT_CONFIG = {
  placeholder: 'Search products and services...',
  className: 'pl-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
} as const;

// Reusable search input component to reduce duplication
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  showPlaceholder?: boolean;
  iconOnly?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onFocus, showPlaceholder = true, iconOnly = false }) => {
  if (iconOnly) {
    return (
      <button
        onClick={onFocus}
        className="p-2 hover:bg-orange-400/20 dark:hover:bg-orange-500/20 rounded-md transition-colors"
        aria-label="Search products and services"
      >
        <Search className="h-5 w-5 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="relative w-full sm:w-64">
      <input
        type="text"
        placeholder={showPlaceholder ? SEARCH_INPUT_CONFIG.placeholder : ''}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={SEARCH_INPUT_CONFIG.className}
        onFocus={onFocus}
        aria-label="Search products and services"
      />
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
};

function HeaderComponent() {
  const { theme, setTheme } = useTheme();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
  });
  const [page, setPage] = useState(1);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const handleFilterChange = useCallback((name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1
    }));
    setPage(1);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setShowSearchModal(true);
  }, []);

  // Define navigation links based on pathname
  const navLinks = [
    { href: '/uscor-features', label: 'Features', target: '' },
    { href: '/hardware', label: 'Hardware', target: '' },
    { href: '#', label: 'Join as Business', isPopover: true, popoverItems: businessTypes },
    { href: '/marketplace', label: 'Marketplace', target: '' },
    // { href: '/freelance-gigs', label: 'Freelance', target: '', rel: '' },
    { href: '/faq', label: 'FAQ', target: '' },
  ];

  return (
    <header className="border-b border-orange-400/60 dark:border-orange-500/70 bg-white dark:bg-card w-full sticky top-0 z-50">
      {/* Default Header View */}
      <div className={`flex h-14 sm:h-16 items-center justify-between gap-4 px-4 lg:px-6 `}>
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
                          <NavigationMenuLink href={link.href} target={link.target}
                            // rel={link.rel}
                            className="">
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
                      <div role="separator" aria-orientation="horizontal" className="bg-background /20  -mx-1 my-1 h-px"></div>
                    </NavigationMenuItem>
                    <NavigationMenuItem className="w-full">
                      {/* Notifications Popover */}
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
                    <NavigationMenuLink href={link.href} target={link.target}
                      // rel={link.rel}
                      className="">
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
          {/* Search for small screens (hidden on lg) */}
          <div className="hidden md:block lg:hidden">
            <SearchInput
              value={filters.search}
              onChange={(value) => handleFilterChange('search', value)}
              onFocus={handleSearchFocus}
            />
          </div>

          {/* Search for medium screens (md:hidden lg:flex) */}
          <div className="hidden lg:flex items-center gap-2">
            <SearchInput
              value={filters.search}
              onChange={(value) => handleFilterChange('search', value)}
              onFocus={handleSearchFocus}
            />
          </div>

          {/* Mobile layout (lg:hidden) */}
          <div className="flex lg:hidden items-center gap-2">
            <SearchInput
              value={filters.search}
              onChange={(value) => handleFilterChange('search', value)}
              onFocus={handleSearchFocus}
              iconOnly={true}
            />
            <Cart />
            <UserDropdown />
          </div>
          <div className="hidden lg:flex gap-2">
            <NotificationsPopover />
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
      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onSearch={(query) => {
            handleFilterChange('search', query);
            setShowSearchModal(false);
          }}
        />
      )}
    </header>
  );
}

export default HeaderComponent;
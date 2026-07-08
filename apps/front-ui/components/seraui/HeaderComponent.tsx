"use client";
import {
    ArrowUpRight,
    ChevronDown,
    MenuIcon,
    MoonIcon,
    Search,
    ShoppingCart,
    SunIcon,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import type React from "react";
import { type ReactNode, useCallback, useState } from "react";
import CartDrawer from "@/app/(browsing)/marketplace/_components/CartDrawer";
import SearchModal from "@/app/(browsing)/marketplace/_components/SearchModal";
import { useCart } from "@/app/context/use-cart";
import { BUSINESS_TYPE_LIST } from "@/config/business-types";
import { Logo } from "../icons/Logos";
import MobileNavDrawer from "../MobileNavDrawer";
import { Button } from "../ui/button";
import NotificationsPopover from "./Notifications";
import { Popover, PopoverContent, PopoverTrigger } from "./PopOver";
import UserDropdown from "./UserDrodown";

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
  "aria-hidden"?: boolean;
  key?: number;
}

interface NavigationMenuLinkProps {
  href: string | undefined;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
}

const NavigationMenu: React.FC<NavigationMenuProps> = ({
  children,
  className = "",
}) => <nav className={`relative z-10 ${className}`}>{children}</nav>;
const NavigationMenuList: React.FC<NavigationMenuListProps> = ({
  children,
  className = "",
}) => <ul className={`flex items-center ${className}`}>{children}</ul>;
const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({
  children,
  className = "",
  ...props
}) => (
  <li className={`list-none ${className}`} {...props}>
    {children}
  </li>
);
const NavigationMenuLink: React.FC<NavigationMenuLinkProps> = ({
  href,
  className = "",
  children,
  target,
  rel,
}) => (
  <a
    href={href}
    className={`block transition-colors ${className}`}
    target={target}
    rel={rel}
  >
    {children}
  </a>
);

// Build business type nav items from centralized config
const businessTypeNavItems = BUSINESS_TYPE_LIST.map((bt) => ({
  href: `/marketplace?businessType=${bt.key}`,
  label: bt.label,
  icon: bt.icon,
}));

// Constants for search input configuration
const SEARCH_INPUT_CONFIG = {
  placeholder: "Search products and services...",
  className:
    "pl-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
} as const;

// Reusable search input component
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  showPlaceholder?: boolean;
  iconOnly?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onFocus,
  showPlaceholder = true,
  iconOnly = false,
}) => {
  if (iconOnly) {
    return (
      <button
        onClick={onFocus}
        className="p-2 hover:bg-orange-400/20 dark:hover:bg-orange-500/20 rounded-md transition-colors"
        aria-label="Search products and services"
      >
        <Search className="h-5 w-5 group-hover:text-gray-700 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className="relative w-full sm:w-64">
      <input
        type="text"
        placeholder={showPlaceholder ? SEARCH_INPUT_CONFIG.placeholder : ""}
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
  });
  const [_page, setPage] = useState(1);
  const { getItemCount } = useCart();
  const [openCart, setOpenCart] = useState(false);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const handleFilterChange = useCallback((name: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
    setPage(1);
  }, []);

  const handleSearchFocus = useCallback(() => {
    setShowSearchModal(true);
  }, []);

  // Navigation links (English, valid routes, USCOR orange hover)
  const navLinks = [
    { href: "/uscor-features", label: "Features", target: "" },
    { href: "/hardware", label: "Hardware", target: "" },
    {
      href: "#",
      label: "Browse",
      isPopover: true,
      popoverItems: businessTypeNavItems,
    },
    { href: "/marketplace", label: "Marketplace", target: "" },
    { href: "/#pricing", label: "Pricing", target: "" },
    { href: "/faq", label: "FAQ", target: "" },
  ];

  return (
    <header className="border-b border-orange-400/60 dark:border-orange-500/70 bg-white dark:bg-card w-full sticky top-0 z-50">
      <div className="flex h-14 sm:h-16 items-center justify-between gap-4 px-4 lg:px-6">
        {/* Left side: Mobile Menu, Logo, Desktop Nav */}
        <div className="flex items-center sm:gap-4">
          {/* Mobile hamburger → opens Sheet drawer */}
          <div className="lg:hidden">
            <Button
              className="group h-8 w-8 hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border hover:border-orange-400/40 dark:hover:border-orange-500/40 transition-all duration-300 ease-out"
              variant="ghost"
              size="icon"
              onClick={() => setMobileNavOpen(true)}
            >
              <MenuIcon />
            </Button>
          </div>

          <Link
            href="/"
            className="text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <Logo />
          </Link>

          {/* Desktop navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navLinks.map((link, index) => (
                <NavigationMenuItem key={index}>
                  {link.isPopover ? (
                    <Popover>
                      <PopoverTrigger>
                        <Button
                          variant="ghost"
                          className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 py-1 font-medium transition-colors"
                        >
                          <span>{link.label}</span>
                          <ChevronDown size={16} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-56 p-1">
                        <NavigationMenuList className="flex-col items-start gap-0">
                          {link.popoverItems?.map((item, i) => (
                            <NavigationMenuItem key={i} className="w-full">
                              <NavigationMenuLink
                                href={item.href}
                                className="flex py-2 px-3 gap-2 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]"
                              >
                                <item.icon size={18} className="text-primary shrink-0" />
                                <span className="text-sm">{item.label}</span>
                              </NavigationMenuLink>
                            </NavigationMenuItem>
                          ))}
                        </NavigationMenuList>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <NavigationMenuLink href={link.href} target={link.target}>
                      <Button
                        variant="link"
                        className="flex cursor-pointer text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 py-1 font-medium transition-colors"
                      >
                        {link.label}
                        {link.target === "_blank" && (
                          <ArrowUpRight size={16} className="opacity-70" />
                        )}
                      </Button>
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side: Search, Theme Toggle, Cart, User */}
        <div className="flex items-center gap-2">
          {/* Search for medium screens */}
          <div className="hidden md:block lg:hidden">
            <SearchInput
              value={filters.search}
              onChange={(value) => handleFilterChange("search", value)}
              onFocus={handleSearchFocus}
            />
          </div>

          {/* Search for large screens */}
          <div className="hidden lg:flex items-center gap-2">
            <SearchInput
              value={filters.search}
              onChange={(value) => handleFilterChange("search", value)}
              onFocus={handleSearchFocus}
            />
          </div>

          {/* Mobile: search icon + cart + user */}
          <div className="flex lg:hidden items-center gap-2">
            <SearchInput
              value={filters.search}
              onChange={(value) => handleFilterChange("search", value)}
              onFocus={handleSearchFocus}
              iconOnly={true}
            />
            <Button
              onClick={() => setOpenCart(!openCart)}
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors relative"
              aria-label="Open cart"
            >
              <ShoppingCart
                aria-hidden="true"
                className="h-6 w-6 shrink-0"
              />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {getItemCount()}
                </span>
              )}
            </Button>
            <UserDropdown />
          </div>

          {/* Desktop: notifications, theme, cart, user */}
          <div className="hidden lg:flex gap-2 items-center">
            <NotificationsPopover />
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            <Button
              onClick={() => setOpenCart(!openCart)}
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors relative"
              aria-label="Open cart"
            >
              <ShoppingCart
                aria-hidden="true"
                className="h-6 w-6 shrink-0"
              />
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                  {getItemCount()}
                </span>
              )}
            </Button>
            <UserDropdown />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer (Sheet) */}
      <MobileNavDrawer
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onSearch={(query) => {
            handleFilterChange("search", query);
            setShowSearchModal(false);
          }}
        />
      )}
      <CartDrawer isOpen={openCart} onClose={() => setOpenCart(!openCart)} />
    </header>
  );
}

export default HeaderComponent;

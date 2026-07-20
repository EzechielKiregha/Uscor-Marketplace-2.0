"use client";

import {
  Bell,
  ChevronDown,
  MenuIcon,
  MoonIcon,
  Search,
  ShoppingCart,
  SunIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import CartDrawer from "@/app/(browsing)/marketplace/_components/CartDrawer";
import SearchModal from "@/app/(browsing)/marketplace/_components/SearchModal";
import { useCart } from "@/app/context/use-cart";
import { BUSINESS_TYPE_LIST } from "@/config/business-types";
import { Logo } from "../icons/Logos";
import MobileNavDrawer from "../MobileNavDrawer";
import { Button } from "../ui/button";
import NotificationsPopover from "./Notifications";
import UserDropdown from "./UserDrodown";

const BUSINESS_TYPE_IMAGES: Record<string, string> = {
  ELECTRONICS: "/images/categories/electronics.jpg",
  RETAIL: "/images/categories/retail.jpg",
  CLOTHING: "/images/categories/clothing.jpg",
  HARDWARE: "/images/categories/hardware.jpg",
  BOOKSTORE: "/images/categories/bookstore.jpg",
  CAFE: "/images/categories/cafe.jpg",
  RESTAURANT: "/images/categories/restaurant.jpg",
  GROCERY: "/images/categories/grocery.jpg",
  ARTISAN: "/images/categories/artisan.jpg",
  BAR: "/images/categories/bar.jpg",
};

const navLinks = [
  { href: "/uscor-features", label: "Features" },
  { href: "/hardware", label: "Hardware" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/faq", label: "FAQ" },
];

function HeaderComponent() {
  const { theme, setTheme } = useTheme();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const browseTimeout = useRef<NodeJS.Timeout | null>(null);
  const browseRef = useRef<HTMLDivElement>(null);
  const { getItemCount } = useCart();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  const handleBrowseEnter = useCallback(() => {
    if (browseTimeout.current) clearTimeout(browseTimeout.current);
    setBrowseOpen(true);
  }, []);

  const handleBrowseLeave = useCallback(() => {
    browseTimeout.current = setTimeout(() => setBrowseOpen(false), 200);
  }, []);

  useEffect(() => {
    return () => {
      if (browseTimeout.current) clearTimeout(browseTimeout.current);
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBrowseOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      <header className="bg-white dark:bg-gray-950 border-b border-orange-200/60 dark:border-orange-900/40 sticky top-0 z-50">
        {/* Top bar - promotional or branding */}
        <div className="hidden lg:block bg-gradient-to-r from-orange-500 to-orange-600 text-white text-center text-xs py-1.5 font-medium tracking-wide">
          USCOR Marketplace — Local businesses, delivered to you
        </div>

        {/* Main navbar */}
        <div className="flex h-14 lg:h-16 items-center justify-between px-4 lg:px-8 max-w-[1440px] mx-auto">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
            >
              <MenuIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
            </button>

            <Link href="/" className="flex items-center shrink-0">
              <Logo />
            </Link>
          </div>

          {/* Center: navigation links (desktop) */}
          <nav className="hidden lg:flex items-center gap-1 ml-8">
            {/* Browse mega menu trigger */}
            <div
              ref={browseRef}
              className="relative"
              onMouseEnter={handleBrowseEnter}
              onMouseLeave={handleBrowseLeave}
            >
              <button
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  browseOpen
                    ? "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30"
                    : "text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                }`}
                onClick={() => setBrowseOpen(!browseOpen)}
                aria-expanded={browseOpen}
                aria-haspopup="true"
              >
                Browse
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${browseOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: search, actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Theme toggle - desktop only */}
            <button
              onClick={toggleTheme}
              className="hidden sm:flex p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5 text-gray-300" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Notifications - desktop */}
            <div className="hidden lg:block">
              <NotificationsPopover />
            </div>

            {/* Cart */}
            <button
              onClick={() => setOpenCart(true)}
              className="relative p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              {getItemCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold leading-none px-1">
                  {getItemCount()}
                </span>
              )}
            </button>

            {/* User */}
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Mega Menu - Browse (rendered outside header to avoid overflow issues) */}
      {browseOpen && (
        <div
          className="fixed inset-x-0 top-[calc(var(--header-height,80px))] z-40 hidden lg:block"
          style={{ top: browseRef.current ? `${browseRef.current.getBoundingClientRect().bottom + 8}px` : "80px" }}
          onMouseEnter={handleBrowseEnter}
          onMouseLeave={handleBrowseLeave}
        >
          <div className="max-w-[1200px] mx-auto">
            <div className="bg-white dark:bg-gray-900 border border-orange-200/60 dark:border-orange-800/40 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 p-6 animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Browse by Business Type
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Explore products from local businesses
                  </p>
                </div>
                <Link
                  href="/marketplace"
                  className="text-xs font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:underline underline-offset-2"
                  onClick={() => setBrowseOpen(false)}
                >
                  View all →
                </Link>
              </div>

              {/* Business type grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {BUSINESS_TYPE_LIST.map((bt) => {
                  const Icon = bt.icon;
                  const imgSrc = BUSINESS_TYPE_IMAGES[bt.key];
                  return (
                    <Link
                      key={bt.key}
                      href={`/marketplace?businessType=${bt.key}`}
                      onClick={() => setBrowseOpen(false)}
                      className="group relative flex flex-col items-center gap-2 p-4 rounded-xl border border-transparent hover:border-orange-200 dark:hover:border-orange-800/60 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition-all duration-200"
                    >
                      {/* Image or icon fallback */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={bt.label}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <div className={`${imgSrc ? "hidden" : ""} flex items-center justify-center w-full h-full`}>
                          <Icon className={`h-6 w-6 ${bt.color.text}`} />
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors leading-tight block">
                          {bt.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="fixed inset-0 -z-10 bg-black/10 dark:bg-black/30"
            onClick={() => setBrowseOpen(false)}
            aria-hidden="true"
          />
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onSearch={(query) => {
            setShowSearchModal(false);
          }}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer isOpen={openCart} onClose={() => setOpenCart(false)} />
    </>
  );
}

export default HeaderComponent;

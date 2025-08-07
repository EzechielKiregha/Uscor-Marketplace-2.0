import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ArrowRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { GlowButton } from './GlowButton';

const Dropdown = ({ title, items, isOpen, onToggle }) => (
  <div className="relative">
    <div onClick={onToggle} className="cursor-pointer">
      <div className="flex items-center gap-1 text-sm font-medium text-sidebar-foreground hover:text-primary dark:text-lightGray dark:hover:text-primary transition-colors">
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
    </div>
    {isOpen && (
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-md bg-card dark:bg-sidebar shadow-lg ring-1 ring-border dark:ring-sidebar-border z-30">
        <div className="py-1">
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block px-4 py-2 text-sm text-sidebar-foreground hover:bg-muted dark:text-lightGray dark:hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    )}
  </div>
);

const HeroSection = ({
  className = '',
  title = 'Discover Uscor Marketplace',
  subtitle = 'Shop top products, hire freelance services, and enjoy exclusive deals across multiple stores.',
  ctaPrimaryText = 'Get Started',
  ctaPrimaryLink = '/products',
  ctaSecondaryText = 'Learn More',
  ctaSecondaryLink = '/about',
  navItems = [
    {
      label: 'Products', href: '/products', dropdownItems: [
        { label: 'Browse All', href: '/products' },
        { label: 'Categories', href: '/categories' },
      ]
    },
    {
      label: 'Freelance', href: '/freelance', dropdownItems: [
        { label: 'Services', href: '/freelance' },
        { label: 'Orders', href: '/freelance/orders' },
      ]
    },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  announcement = {
    text: 'Join thousands of users on Uscor Marketplace',
    href: '/signup',
    avatars: ['https://i.pravatar.cc/150?img=1', 'https://i.pravatar.cc/150?img=2', 'https://i.pravatar.cc/150?img=3'],
  },
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`hero-section w-full ${className}`}>
      <nav ref={navRef} className="relative z-20 bg-background/80 backdrop-blur-sm border-b border-border top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-bold text-sidebar-foreground dark:text-lightGray">
              Uscor Marketplace
            </span>
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) =>
                item.dropdownItems ? (
                  <Dropdown
                    key={item.label}
                    title={item.label}
                    items={item.dropdownItems}
                    isOpen={openDropdown === item.label}
                    onToggle={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  />
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="text-sm font-medium text-sidebar-foreground hover:text-primary dark:text-lightGray dark:hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}
              <Link href="/login">
                <GlowButton className="h-9 px-4 py-2 text-sm">Login</GlowButton>
              </Link>
            </div>
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-sidebar-foreground hover:text-primary dark:text-lightGray dark:hover:text-primary"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden bg-card border-t border-border">
            <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block px-3 py-3 rounded-md text-base font-medium text-sidebar-foreground hover:text-primary hover:bg-muted dark:text-lightGray dark:hover:bg-muted"
                >
                  {item.label}
                </Link>
              ))}
              <GlowButton onClick={() => (window.location.href = '/login')} className="mt-4 w-full h-10 px-4 py-2 text-sm">
                Login
              </GlowButton>
            </div>
          </div>
        )}
      </nav>
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-24 lg:pt-32 lg:pb-32">
          <div className="flex justify-center mb-6">
            <Link
              href={announcement.href}
              className="inline-flex items-center gap-2 border border-border rounded-full px-3 py-1 text-xs sm:text-sm font-medium hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors"
            >
              <div className="flex -space-x-2">
                {announcement.avatars.map((avatar, i) => (
                  <img
                    key={i}
                    className="w-5 h-5 rounded-full border border-white dark:border-background"
                    src={avatar}
                    alt={`User ${i + 1}`}
                  />
                ))}
              </div>
              <span className="text-sidebar-foreground dark:text-lightGray hidden sm:inline">
                {announcement.text}
              </span>
              <span className="text-sidebar-foreground dark:text-lightGray sm:hidden">
                Join Now
              </span>
              <ArrowRight className="w-4 h-4 text-muted dark:text-muted" />
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-sidebar-foreground dark:text-lightGray mb-6">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-muted dark:text-muted max-w-xl md:max-w-3xl mx-auto mb-10">
              {subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlowButton onClick={() => (window.location.href = ctaPrimaryLink)} className="h-11 px-8 text-base">
                {ctaPrimaryText}
              </GlowButton>
              <GlowButton
                onClick={() => (window.location.href = ctaSecondaryLink)}
                className="h-11 px-8 text-base bg-card text-primary border border-primary hover:bg-primary hover:text-white dark:bg-card dark:text-primary dark:border-primary dark:hover:bg-primary dark:hover:text-white"
              >
                {ctaSecondaryText}
              </GlowButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeroSection;

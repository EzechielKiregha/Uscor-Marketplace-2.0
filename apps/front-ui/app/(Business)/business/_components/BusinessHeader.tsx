// app/business/_components/BusinessHeader.tsx
'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useMe } from '@/lib/useMe';
import { Button } from '@/components/ui/button';
import { Menu, Search, Bell, Settings } from 'lucide-react';
import { useOpenCreateProductModal } from '../_hooks/use-open-create-product-modal';
import CreateProductModal from './modals/CreateProductModal';
import { sidebarItems } from './BusinessSidebar';
import { useOpenCreateServiceModal } from '../_hooks/use-open-create-service-modal';
import UserDropdown from '@/components/seraui/UserDrodown';
import { MoonIcon, SunIcon } from '@/components/icons/Logos';

interface BusinessHeaderProps {
  business: any; // Replace with actual BusinessEntity type
}

export default function BusinessHeader({ business }: BusinessHeaderProps) {
  const { user, role } = useMe();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isOpen: isProductModalOpen, setIsOpen: setIsProductModalOpen } = useOpenCreateProductModal();
  const { isOpen: isServiceModalOpen, setIsOpen: setIsServiceModalOpen } = useOpenCreateServiceModal();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b border-border bg-card h-16 flex items-center px-4 md:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden mr-2"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Search products, orders, customers..."
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 ml-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
        </Button>
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

        <div className="hidden sm:flex items-center gap-2">
          <UserDropdown />
        </div>

        <div className="hidden lg:flex items-center justify-between flex-raw gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsProductModalOpen(true)}
          >
            Add Product
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsServiceModalOpen(true)}
          >
            Add Service
          </Button>
        </div>
      </div>

      {/* Modals */}
      <CreateProductModal />
      {/* <CreateServiceModal /> */}

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-background/90 z-50 md:hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <div className="flex items-center gap-3">
              {business.avatar ? (
                <img
                  src={business.avatar}
                  alt={business.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {business.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="font-semibold text-foreground">{business.name}</h2>
                <p className="text-xs text-muted-foreground">Business Account</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowMobileMenu(false)}>
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          <nav className="mt-4">
            {sidebarItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-muted"
                onClick={() => setShowMobileMenu(false)}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                    3
                  </span>
                )}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
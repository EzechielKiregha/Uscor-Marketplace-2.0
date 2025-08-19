// app/business/_components/BusinessSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users, ShoppingCart, MessageSquare, BarChart, Settings, Package, Star, BriefcaseBusiness, Building } from 'lucide-react';

interface BusinessSidebarProps {
  business: any; // Replace with actual BusinessEntity type
}

export const sidebarItems = [
  { href: '/business/dashboard', icon: BarChart, label: 'Dashboard' },
  { href: '/business/stores', icon: Building, label: 'Stores' },
  { href: '/business/sales', icon: ShoppingCart, label: 'Point of Sale' },
  { href: '/business/inventory', icon: Package, label: 'Inventory' },
  { href: '/business/products', icon: Package, label: 'Products' },
  { href: '/business/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/business/services', icon: BriefcaseBusiness, label: 'Services' },
  { href: '/business/chats', icon: MessageSquare, label: 'Messages', badge: true },
  { href: '/business/reposts', icon: Star, label: 'Reposts & Reowns' },
  { href: '/business/loyalty', icon: Star, label: 'Loyalty Program' },
  { href: '/business/settings', icon: Settings, label: 'Settings' },
];

export default function BusinessSidebar({ business }: BusinessSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {business.avatar ? (
            <img
              src={business.avatar}
              alt={business.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {business.name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="font-semibold text-foreground truncate w-36">{business.name}</h2>
            <p className="text-xs text-muted-foreground">Business Account</p>
          </div>
        </div>
      </div>

      <nav className="p-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
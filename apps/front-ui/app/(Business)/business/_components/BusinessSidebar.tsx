'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Users, ShoppingCart, MessageSquare, BarChart, Settings, Package, Star, BriefcaseBusiness, Building } from 'lucide-react';
import { use, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_UNREAD_COUNT } from '@/graphql/chat.gql';

interface BusinessSidebarProps {
  business: any; // Replace with actual BusinessEntity type
  isOpen?: boolean;
}

export const sidebarItems = [
  { href: '/business/dashboard', icon: BarChart, label: 'Dashboard' },
  { href: '/business/stores', icon: Building, label: 'Stores' },
  { href: '/business/sales', icon: ShoppingCart, label: 'Point of Sale' },
  { href: '/business/inventory', icon: Package, label: 'Inventory' },
  { href: '/business/products', icon: Package, label: 'Products' },
  { href: '/business/dashboard/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/business/freelance-services', icon: BriefcaseBusiness, label: 'Services' },
  { href: '/business/dashboard/chats', icon: MessageSquare, label: 'Messages', badge: true },
  { href: '/business/reposts', icon: Star, label: 'Reposts & Reowns' },
  { href: '/business/loyalty', icon: Star, label: 'Loyalty Program' },
  { href: '/business/settings', icon: Settings, label: 'Settings' },
];

export default function BusinessSidebar({ business, isOpen = true }: BusinessSidebarProps) {
  const pathname = usePathname();
  const [count, setCount] = useState<number>(0);

  const { data: unreadMessages } = useQuery(GET_UNREAD_COUNT, {
    variables: {
      userId: business.id,
    }
  })

  useEffect(() => {
    if (unreadMessages) {
      setCount(unreadMessages.unreadChatCount.totalUnread)
    }
  }, [unreadMessages])

  const containerClass = isOpen
    ? 'hidden md:block w-64 bg-card border-r border-orange-400/60 dark:border-orange-500/70 h-screen sticky top-0 transition-all duration-200'
    : 'hidden md:block w-16 bg-card border-r border-orange-400/60 dark:border-orange-500/70 h-screen sticky top-0 transition-all duration-200';

  return (
    <aside className={containerClass}>
      <div className="p-3 border-b border-border flex items-center justify-center">
        {business.avatar ? (
          <img
            src={business.avatar}
            alt={business.name}
            className={isOpen ? 'w-10 h-10 rounded-full object-cover' : 'w-8 h-8 rounded-full object-cover'}
          />
        ) : (
          <div className={isOpen ? 'w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary' : 'w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary'}>
            {business.name.charAt(0)}
          </div>
        )}
        {isOpen && (
          <div className="ml-3">
            <h2 className="font-semibold text-foreground truncate w-36">{business.name}</h2>
            <p className="text-xs text-muted-foreground">Business Account</p>
          </div>
        )}
      </div>

      <nav className="p-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                `flex items-center ${isOpen ? 'px-4 py-2 gap-1.5' : 'flex-col py-3 gap-0.5'} text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]`,
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className={isOpen ? 'w-4 h-4' : 'w-5 h-5'} />
              {isOpen && <span>{item.label}</span>}
              {item.badge && (
                <span className={isOpen ? 'ml-auto bg-primary text-xs rounded-full px-2 py-0.5' : 'mt-1 bg-primary text-xs rounded-full px-2 py-0.5'}>
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
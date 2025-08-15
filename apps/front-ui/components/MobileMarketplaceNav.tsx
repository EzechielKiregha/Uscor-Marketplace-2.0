'use client';

import { PRODUCT_CATEGORIES } from '@/config';
import { useNavigation } from '@/hooks/useNavigation';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const MobileMarketplaceNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const nav = useNavigation();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:text-gray-500"
        aria-label="Open menu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12L20 12" className="origin-center -translate-y-[7px] transition-all" />
          <path d="M4 12H20" className="origin-center transition-all" />
          <path d="M4 12H20" className="origin-center translate-y-[7px] transition-all" />
        </svg>
      </button>
    );
  }

  return (
    <div className="lg:hidden">
      <div className="relative z-50">
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      </div>

      <div className="fixed inset-0 z-50 flex">
        <div className="w-4/5 max-w-sm">
          <ScrollArea className="h-full bg-card shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <Link href="/" className="font-bold text-xl text-foreground" onClick={() => setIsOpen(false)}>
                Uscor
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {PRODUCT_CATEGORIES.map((category) => (
                <div key={category.label} className="mb-8 last:mb-0">
                  <h3 className="text-sm font-semibold text-foreground mb-4">{category.label}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {category.featured.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => {
                          nav(item.href);
                          setIsOpen(false);
                        }}
                        className="group flex flex-col"
                      >
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                          <Image
                            src={item.imageSrc}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-6 py-6 space-y-4">
              <Link
                href="/login"
                onClick={() => closeOnCurrent('/login')}
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/pricing"
                onClick={() => closeOnCurrent('/pricing')}
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/help"
                onClick={() => closeOnCurrent('/help')}
                className="block text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                Help
              </Link>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default MobileMarketplaceNav;
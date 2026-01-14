'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FREELANCE_SERVICE_CATEGORIES } from '@/config/freelance-categories';
import { useOnClickOutside } from '@/hooks/use-on-outside-click';
import { Button } from '@/components/ui/button';
import { X, Menu } from 'lucide-react';

// --- Mobile Drawer Component ---
const MobileFreelanceDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(drawerRef, () => setIsOpen(false));

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen]);

  return (
    <>
      {/* Mobile Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="Open freelance menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Full-Screen Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div ref={drawerRef} className="absolute inset-y-0 left-0 w-4/5 max-w-sm bg-card shadow-xl border-r border-border">
            <div className="flex h-16 items-center justify-between border-b border-border px-6">
              <h2 className="text-lg font-semibold text-foreground">Services</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {FREELANCE_SERVICE_CATEGORIES.map((category) => (
                <div key={category.label} className="mb-6 last:mb-0">
                  <h3 className="px-3 text-sm font-semibold text-foreground mb-3">{category.label}</h3>
                  <div className="space-y-1">
                    {category.services.map((service) => (
                      <a
                        key={service.name}
                        href={service.href}
                        className="block p-3 rounded-lg hover:bg-muted transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <p className="text-sm font-medium text-foreground">{service.name}</p>
                        {service.desc && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{service.desc}</p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- Desktop Popover Component ---
const DesktopFreelancePopover = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(navRef, () => setActiveIndex(null));

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="hidden lg:flex" ref={navRef}>
      {FREELANCE_SERVICE_CATEGORIES.map((category, i) => {
        const isOpen = i === activeIndex;
        const handleOpen = () => setActiveIndex(isOpen ? null : i);

        return (
          <div key={i} className="relative">
            <Button
              title={category.label}
              className={`px-4 py-2 text-sm font-medium transition-colors ${isOpen
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
                }`}
              onMouseEnter={handleOpen}
              aria-expanded={isOpen}
            >
              {category.label}
            </Button>

            {isOpen && (
              <div className="absolute left-0 top-full mt-2 w-80 rounded-xl bg-card border border-orange-400/60 dark:border-orange-500/70 shadow-lg overflow-hidden z-10">
                <div className="p-4 max-h-96 overflow-y-auto">
                  {category.services.map((service) => (
                    <a
                      key={service.name}
                      href={service.href}
                      className="block p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground">{service.name}</p>
                      {service.desc && (
                        <p className="text-xs text-muted-foreground mt-1">{service.desc}</p>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- Main Export: Responsive Freelance Nav ---
const ResponsiveFreelanceNav = () => {
  return (
    <>
      <MobileFreelanceDrawer />
      <DesktopFreelancePopover />
    </>
  );
};

export default ResponsiveFreelanceNav;
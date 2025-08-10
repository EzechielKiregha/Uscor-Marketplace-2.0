'use client';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import React, { useState, useId, useRef, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import NavItems from '../NavItems';
import FreelanceNavItems from '../FreelanceNavItems';
import Link from 'next/link';

// Type definitions
interface SearchIconProps {
  size?: number;
}

interface ButtonProps {
  asChild?: boolean;
  className?: string;
  variant?: 'default' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
  children?: ReactNode;
  onClick?: () => void;
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

interface PopoverContextType {
  isOpen: boolean;
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  popoverRef: React.RefObject<HTMLDivElement | null>;
}

interface PopoverProps {
  children: ReactNode;
}

interface PopoverTriggerProps {
  children: ReactNode;
}

interface PopoverContentProps {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
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

const Logo: React.FC = () => (
  <div className="flex items-center justify-center gap-2">
    <Image alt='logo' src='/logo.png' width={50} height={40} />
    <span className="font-bold sm:text-lg tracking-wider text-primary text-2xl ">Uscor Marketplace</span>
  </div>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild = false, className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
  const Comp = asChild ? 'span' : 'button';
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variantClasses: Record<string, string> = {
    default: "bg-background dark:bg-gray-950 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white",
  };
  const sizeClasses: Record<string, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    icon: "h-8 w-8 sm:h-10 sm:w-10",
  };
  const elementProps = props as React.HTMLAttributes<HTMLElement>;
  return <Comp className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`} ref={ref} {...elementProps}>{children}</Comp>;
});
Button.displayName = 'Button';

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => (
  <input
    className={`form-field flex h-9 sm:h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

const NavigationMenu: React.FC<NavigationMenuProps> = ({ children, className = '' }) => <nav className={`relative z-10 ${className}`}>{children}</nav>;
const NavigationMenuList: React.FC<NavigationMenuListProps> = ({ children, className = '' }) => <ul className={`flex items-center ${className}`}>{children}</ul>;
const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({ children, className = '', ...props }) => <li className={`list-none ${className}`} {...props}>{children}</li>;
const NavigationMenuLink: React.FC<NavigationMenuLinkProps> = ({ href, className = '', children, target, rel }) => (
  <a href={href} className={`block px-3 transition-colors ${className}`} target={target} rel={rel}>
    {children}
  </a>
);

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

const Popover: React.FC<PopoverProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen, popoverRef }}>
      <div ref={popoverRef} className="relative">{children}</div>
    </PopoverContext.Provider>
  );
};

const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children }) => {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error('PopoverTrigger must be used within a Popover');
  const { isOpen, setIsOpen } = context;
  const child = React.Children.only(children);
  return React.cloneElement(child as React.ReactElement<{ onClick?: () => void; 'aria-expanded'?: boolean }>, {
    onClick: () => setIsOpen((open: boolean) => !open),
    'aria-expanded': isOpen
  });
};

const PopoverContent: React.FC<PopoverContentProps> = ({ children, className = '', align = 'center' }) => {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error('PopoverContent must be used within a Popover');
  const { isOpen } = context;
  const alignmentClasses: Record<string, string> = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  };
  if (!isOpen) return null;
  return (
    <div className={`absolute top-full mt-2 w-screen max-w-xs z-20 rounded-xl backdrop-blur-xl bg-white/95 dark:bg-gray-950/95 border border-orange-400/60 dark:border-orange-500/70 p-2 shadow-lg ${alignmentClasses[align]} ${className}`}>
      {children}
    </div>
  );
};

// Navigation links configuration
const businessTypes = [
  { href: '/business-types/grocery', label: 'Grocery & convenience' },
  { href: '/business-types/cafe', label: 'Café' },
  { href: '/business-types/restaurant', label: 'Restaurant' },
  { href: '/business-types/retail', label: 'Retail' },
  { href: '/business-types/bar', label: 'Bar & Pub' },
  { href: '/business-types/clothing', label: 'Clothing & accessories' },
];

const marketplaceBusinessTypes = [
  { href: '/business-types/artisan', label: 'Artisan Shop' },
  { href: '/business-types/tool-making', label: 'Tool making' },
  ...businessTypes,
];

function HeaderComponent() {
  const id = useId();
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Define navigation links based on pathname
  const navLinks = pathname === '/marketplace' ? [
    { href: '/uscor-features', label: 'Features', target: '_blank', rel: 'noopener noreferrer' },
    { href: '/hardware', label: 'Hardware', target: '_blank', rel: 'noopener noreferrer' },
    { href: '#', label: 'Business types', isPopover: true, popoverItems: marketplaceBusinessTypes, target: '_blank', rel: 'noopener noreferrer' },
    { compLinks: NavItems, target: '_blank', rel: 'noopener noreferrer' },
    // { href: '/freelance-gigs', label: 'freelance', target: '_blank', rel: 'noopener noreferrer' },
    // { href: '/help', label: 'help', target: '_blank', rel: 'noopener noreferrer' },
  ] : pathname === '/freelance-gigs' ? [
    { href: '/uscor-features', label: 'Features', target: '_blank', rel: 'noopener noreferrer' },
    { href: '/hardware', label: 'Hardware', target: '_blank', rel: 'noopener noreferrer' },
    { compLinks: FreelanceNavItems, target: '_blank', rel: 'noopener noreferrer' },
    { href: '/help', label: 'help', target: '_blank', rel: 'noopener noreferrer' },
  ] : [
    { href: '/uscor-features', label: 'Features', target: '_blank', rel: 'noopener noreferrer' },
    { href: '/hardware', label: 'Hardware', target: '_blank', rel: 'noopener noreferrer' },
    { compLinks: "", target: '_blank', rel: 'noopener noreferrer' },
    { href: '#', label: 'Business types', isPopover: true, popoverItems: businessTypes },
    { href: '/marketplace', label: 'Marketplace', target: '_blank', rel: 'noopener noreferrer' },
    { href: '/freelance-gigs', label: 'freelance', target: '_blank', rel: 'noopener noreferrer' },
    { href: '/help', label: 'help', target: '_blank', rel: 'noopener noreferrer' },
  ];

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 w-full sticky top-0 z-50">
      {/* Mobile Search View */}
      {isMobileSearchVisible && (
        <div className="flex h-14 sm:h-16 items-center gap-2 lg:hidden px-4">
          <div className="relative flex-1">
            <Input
              id={id + "-mobile-search"}
              className="form-field h-9 pl-9 pr-2 w-full"
              placeholder="Search product..."
              type="search"
              autoFocus
            />
            <div className="text-gray-400 dark:text-gray-500 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3">
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
        <div className="flex items-center gap-2 sm:gap-4">
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
                      link.compLinks ? (
                        <NavigationMenuItem key={index} className="w-full">
                          <link.compLinks />
                        </NavigationMenuItem>
                      ) : (
                        <NavigationMenuItem key={index} className="w-full">
                          {link.isPopover ? (
                            <Popover>
                              <PopoverTrigger>
                                <Button asChild variant="ghost" className="py-2 px-3 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]">
                                  <span>{link.label}</span>
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="start" className="w-48 p-1">
                                <NavigationMenuList className="flex-col items-start gap-0">
                                  {link.popoverItems?.map((item, i) => (
                                    <NavigationMenuItem key={i} className="w-full">
                                      <NavigationMenuLink href={item.href} className="py-2 px-3 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]">
                                        {item.label}
                                      </NavigationMenuLink>
                                    </NavigationMenuItem>
                                  ))}
                                </NavigationMenuList>
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <NavigationMenuLink href={link.href} target={link.target} rel={link.rel} className="py-2 px-3 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]">
                              {link.label}
                            </NavigationMenuLink>
                          )}
                        </NavigationMenuItem>
                      )
                    ))}
                    <NavigationMenuItem className="w-full" role="presentation" aria-hidden={true}>
                      <div role="separator" aria-orientation="horizontal" className="bg-background dark:bg-gray-950/20  -mx-1 my-1 h-px"></div>
                    </NavigationMenuItem>
                    <NavigationMenuItem className="w-full">
                      <Button
                        onClick={toggleTheme}
                        asChild variant="ghost" size="sm" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
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
                      <NavigationMenuLink href="/login" className="py-2 px-3 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]">
                        Sign In
                      </NavigationMenuLink>
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
            <NavigationMenuList className="gap-2">
              {navLinks.map((link, index) => (
                <NavigationMenuItem key={index} className="">
                  {link.compLinks ? (
                    <link.compLinks />
                  ) : link.isPopover ? (
                    <Popover>
                      <PopoverTrigger>
                        <Button asChild variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 py-1.5 font-medium transition-colors">
                          <span>{link.label}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-48 p-1">
                        <NavigationMenuList className="flex-col items-start gap-0">
                          {link.popoverItems?.map((item, i) => (
                            <NavigationMenuItem key={i} className="w-full">
                              <NavigationMenuLink href={item.href} className="py-2 px-3 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]">
                                {item.label}
                              </NavigationMenuLink>
                            </NavigationMenuItem>
                          ))}
                        </NavigationMenuList>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <NavigationMenuLink href={link.href} target={link.target} rel={link.rel} className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 py-1.5 font-medium transition-colors">
                      {link.label}
                    </NavigationMenuLink>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right side: Search, Theme Toggle, and Sign In */}
        <div className="flex items-center gap-2">
          <div className="relative hidden lg:block">
            <Input id={id} className="form-field h-9 pl-9 pr-2 w-64" placeholder="Search..." type="search" />
            <div className="text-gray-400 dark:text-gray-500 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3">
              <SearchIcon size={16} />
            </div>
          </div>
          <div className="lg:hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsMobileSearchVisible(true)}>
              <SearchIcon size={18} />
            </Button>
          </div>
          <div className="hidden lg:flex">
            <Button
              onClick={toggleTheme}
              asChild variant="ghost" size="sm" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            <Button asChild variant="ghost" size="sm" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
              <a href="/login">Sign In</a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeaderComponent;
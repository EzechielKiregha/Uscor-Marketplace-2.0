'use client';
import { useTheme } from 'next-themes';
import React, { useState, useId, useRef, useEffect, ReactNode } from 'react';

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
  href: string;
  className?: string;
  children: ReactNode;
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

// Helper components to replicate the UI library's functionality
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
// --- Icon Components ---
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

// This component relies on the parent's `group` and `aria-expanded` attribute for animations.
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

// --- UI Components ---
const Logo: React.FC = () => (
  <div className="flex items-center justify-center gap-2">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 200 200" width="28" height="28">
      <g clipPath="url(#cs_clip_1_flower-1)">
        <mask id="cs_mask_1_flower-1" style={{ maskType: "alpha" }} width="200" height="186" x="0" y="7" maskUnits="userSpaceOnUse">
          <path fill="#fff" d="M150.005 128.863c66.681 38.481-49.997 105.828-49.997 28.861 0 76.967-116.658 9.62-49.997-28.861-66.681 38.481-66.681-96.207 0-57.727-66.681-38.48 49.997-105.827 49.997-28.86 0-76.967 116.657-9.62 49.997 28.86 66.66-38.48 66.66 96.208 0 57.727z"></path>
        </mask>
        <g mask="url(#cs_mask_1_flower-1)">
          <path fill="#fff" d="M200 0H0v200h200V0z"></path>
          <path fill="url(#paint0_linear_748_4711)" d="M200 0H0v200h200V0z"></path>
          <g filter="url(#filter0_f_748_4711)">
            <path fill="#FF58E4" d="M130 0H69v113h61V0z"></path>
            <path fill="#0CE548" fillOpacity="0.35" d="M196 91H82v102h114V91z"></path>
            <path fill="#FFE500" fillOpacity="0.74" d="M113 80H28v120h85V80z"></path>
          </g>
        </g>
      </g>
      <defs>
        <filter id="filter0_f_748_4711" width="278" height="310" x="-27" y="-55" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
          <feGaussianBlur result="effect1_foregroundBlur_748_4711" stdDeviation="27.5"></feGaussianBlur>
        </filter>
        <linearGradient id="paint0_linear_748_4711" x1="186.5" x2="37" y1="37" y2="186.5" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0E6FFF" stopOpacity="0.51"></stop>
          <stop offset="1" stopColor="#00F0FF" stopOpacity="0.59"></stop>
        </linearGradient>
        <clipPath id="cs_clip_1_flower-1">
          <path fill="#fff" d="M0 0H200V200H0z"></path>
        </clipPath>
      </defs>
      <g style={{ mixBlendMode: "overlay" }} mask="url(#cs_mask_1_flower-1)">
        <path fill="gray" stroke="transparent" d="M200 0H0v200h200V0z" filter="url(#cs_noise_1_flower-1)"></path>
      </g>
      <defs>
        <filter id="cs_noise_1_flower-1" width="100%" height="100%" x="0%" y="0%" filterUnits="objectBoundingBox">
          <feTurbulence baseFrequency="0.6" numOctaves="5" result="out1" seed="4"></feTurbulence>
          <feComposite in="out1" in2="SourceGraphic" operator="in" result="out2"></feComposite>
          <feBlend in="SourceGraphic" in2="out2" mode="overlay" result="out3"></feBlend>
        </filter>
      </defs>
    </svg>
    <span className="font-bold text-base sm:text-lg tracking-wider text-black dark:text-white">Uscor Marketplace</span>
  </div>
);

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ asChild = false, className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
  const Comp = asChild ? 'span' : 'button';
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const variantClasses: Record<string, string> = {
    default: "bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200",
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
    className={`form-field flex h-9 sm:h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-black px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

const NavigationMenu: React.FC<NavigationMenuProps> = ({ children, className = '' }) => <nav className={`relative z-10 ${className}`}>{children}</nav>;
const NavigationMenuList: React.FC<NavigationMenuListProps> = ({ children, className = '' }) => <ul className={`flex items-center ${className}`}>{children}</ul>;
const NavigationMenuItem: React.FC<NavigationMenuItemProps> = ({ children, className = '', ...props }) => <li className={`list-none ${className}`} {...props}>{children}</li>;
const NavigationMenuLink: React.FC<NavigationMenuLinkProps> = ({ href, className = '', children }) => (
  <a href={href} className={`block px-3 transition-colors ${className}`}>
    {children}
  </a>
);

// --- Popover Component ---
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
    <div className={`absolute top-full mt-2 w-screen max-w-xs z-20 rounded-xl backdrop-blur-xl bg-white/95 dark:bg-black/95 border border-orange-400/60 dark:border-orange-500/70 p-2 shadow-lg ${alignmentClasses[align]} ${className}`}>
      {children}
    </div>
  );
};

// --- Main Header Component ---
const navigationLinks = [
  { href: "#", label: "Products" },
  { href: "#", label: "Categories" },
  { href: "#", label: "Deals" },
];

function HeaderComponent() {
  const id = useId();
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black w-full sticky top-0 z-50">
      {/* Mobile Search View */}
      {isMobileSearchVisible && (
        <div className="flex h-14 sm:h-16 items-center gap-2 lg:hidden px-4">
          <div className="relative flex-1">
            <Input
              id={id + "-mobile-search"}
              className="form-field h-9 pl-9 pr-2 w-full"
              placeholder="Search..."
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
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index} className="w-full">
                        <NavigationMenuLink href={link.href} className="py-2 px-3 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]">
                          {link.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                    <NavigationMenuItem className="w-full" role="presentation" aria-hidden={true}>
                      <div role="separator" aria-orientation="horizontal" className="bg-black/20 dark:bg-white/20 -mx-1 my-1 h-px"></div>
                    </NavigationMenuItem>
                    <NavigationMenuItem className="w-full">
                      {/* Theme Toggle Button */}
                      <Button
                        onClick={toggleTheme}
                        className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500 dark:focus:ring-gray-400 transition-colors duration-300"
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
                      <NavigationMenuLink href="#" className="py-2 px-3 text-black/90 dark:text-white/90 hover:text-black dark:hover:text-white hover:bg-orange-400/20 dark:hover:bg-orange-500/20 hover:border-l-2 hover:border-orange-400/60 dark:hover:border-orange-500/60 rounded-md transition-all duration-300 ease-out backdrop-blur-sm hover:shadow-sm hover:scale-[1.02]">
                        Sign In
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </PopoverContent>
            </Popover>
          </div>
          <a href="#" className="text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
            <Logo />
          </a>
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-2">
              {navigationLinks.map((link, index) => (
                <NavigationMenuItem key={index} className="">
                  <NavigationMenuLink href={link.href} className="text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 py-1.5 font-medium transition-colors">
                    {link.label}
                  </NavigationMenuLink>
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
            {/* Theme Toggle Button */}
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
              <a href="#">Sign In</a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default HeaderComponent;
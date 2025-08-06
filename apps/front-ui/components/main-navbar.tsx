// components/Navbar.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/Icons';
import { Moon, Sun, Menu, X, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
// import Cart from './Cart';
import { ModeToggle } from './mode-toggle';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Accueil', href: '/' },
  { label: 'Produits', href: '/products' },
  { label: 'Freelance', href: '/freelance' },
  { label: 'Publicités', href: '/ads' },
  { label: 'À propos', href: '/about' },
];

export const MainNavbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = React.useState(false);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className={`sticky z-50 top-0 inset-x-0 h-16 transition-colors duration-300 bg-white dark:bg-gray-950 shadow-sm dark:text-gray-100 text-gray-950`}>
      <div className="absolute inset-0 z-0">
        <Canvas>
          <Stars radius={20} count={200} factor={2} fade speed={1} />
        </Canvas>
      </div>
      <header className="relative shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image alt='logo' src='/logo.png' width={50} height={40} />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">Uscor</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (

              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex felx-col space-x-2 ml-4 pr-2.5 lg:ml-6">
              <ModeToggle />
              {/* <Cart /> */}
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center">
            <Button size="sm" variant="ghost" onClick={toggleTheme} className="mr-2">
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            <DropdownMenu.Root open={open} onOpenChange={setOpen}>
              <DropdownMenu.Trigger asChild>
                <Button size="sm" variant="ghost">
                  {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </DropdownMenu.Trigger>
              <AnimatePresence>
                {open && (
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={5}
                    asChild
                    forceMount
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-3"
                    >
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          onClick={() => setOpen(false)}
                        >
                          {item.label}
                        </Link>

                      ))}
                      <div className="flex felx-raw space-x-2 ml-4 pr-2.5 lg:ml-6">
                        {/* <ModeToggle /> */}
                        {/* <Cart /> */}
                      </div>
                    </motion.div>
                  </DropdownMenu.Content>
                )}
              </AnimatePresence>
            </DropdownMenu.Root>
          </div>
        </div>
      </header>
    </div>
  );
};

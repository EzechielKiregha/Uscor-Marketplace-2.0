import React, { ReactNode, useEffect, useRef, useState } from "react";


interface PopoverCategoryContextType {
  isOpen: boolean;
  setIsOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
  popoverRef: React.RefObject<HTMLDivElement | null>;
}

interface PopoverCategoryProps {
  children: ReactNode;
}

interface PopoverCategoryTriggerProps {
  children: ReactNode;
}

interface PopoverCategoryContentProps {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export const PopoverCategoryContext = React.createContext<PopoverCategoryContextType | undefined>(undefined);

export const PopoverCategory: React.FC<PopoverCategoryProps> = ({ children }) => {
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
    <PopoverCategoryContext.Provider value={{ isOpen, setIsOpen, popoverRef }}>
      <div ref={popoverRef} className="relative">{children}</div>
    </PopoverCategoryContext.Provider>
  );
};

export const PopoverCategoryTrigger: React.FC<PopoverCategoryTriggerProps> = ({ children }) => {
  const context = React.useContext(PopoverCategoryContext);
  if (!context) throw new Error('PopoverCategoryTrigger must be used within a PopoverCategory');
  const { isOpen, setIsOpen } = context;
  const child = React.Children.only(children);
  return React.cloneElement(child as React.ReactElement<{ onClick?: () => void; 'aria-expanded'?: boolean }>, {
    onClick: () => setIsOpen((open: boolean) => !open),
    'aria-expanded': isOpen
  });
};

export const PopoverCategoryContent: React.FC<PopoverCategoryContentProps> = ({ children, className = '', align = 'center' }) => {
  const context = React.useContext(PopoverCategoryContext);
  if (!context) throw new Error('PopoverCategoryContent must be used within a PopoverCategory');
  const { isOpen } = context;
  const alignmentClasses: Record<string, string> = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  };
  if (!isOpen) return null;
  return (
    <div className={`absolute top-full mt-2 w-screen z-20 rounded-xl backdrop-blur-xl bg-white/95 /95 border border-orange-400/60 dark:border-orange-500/70 p-2 shadow-lg ${alignmentClasses[align]} ${className}`}>
      {children}
    </div>
  );
};
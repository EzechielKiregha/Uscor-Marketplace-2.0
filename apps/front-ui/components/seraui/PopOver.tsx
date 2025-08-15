import React, { ReactNode, useEffect, useRef, useState } from "react";


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

export const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined);

export const Popover: React.FC<PopoverProps> = ({ children }) => {
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

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children }) => {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error('PopoverTrigger must be used within a Popover');
  const { isOpen, setIsOpen } = context;
  const child = React.Children.only(children);
  return React.cloneElement(child as React.ReactElement<{ onClick?: () => void; 'aria-expanded'?: boolean }>, {
    onClick: () => setIsOpen((open: boolean) => !open),
    'aria-expanded': isOpen
  });
};

export const PopoverContent: React.FC<PopoverContentProps> = ({ children, className = '', align = 'center' }) => {
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
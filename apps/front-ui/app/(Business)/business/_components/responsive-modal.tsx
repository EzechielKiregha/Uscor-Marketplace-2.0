"use client";

import { useMedia } from "react-use";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";

interface ResponsiveModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function ResponsiveModal({
  children,
  isOpen,
  setIsOpen,
  title,
  description,
  size = "md",
}: ResponsiveModalProps) {
  const isDesktop = useMedia("(min-width: 1024px)", true);

  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
  };

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={`w-full p-0 border-none overflow-y-auto ${sizeClasses[size]}`}>
          <DialogTitle className="hidden">{title}</DialogTitle>
          <div className="relative">
            {/* <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 z-10"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button> */}
            {title && (
              <div className="border-b border-border px-6 py-4">
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
            )}
            <div className="p-6 pt-0">{children}</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <DrawerTitle className="hidden">{title}</DrawerTitle>
        <div className="overflow-y-auto max-h-[85vh]">
          {title && (
            <div className="border-b border-border px-4 py-3 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="p-4">{children}</div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
// components/ui/toast-provider.tsx
'use client';

import React, { createContext, useContext, useRef, useState, ReactNode } from 'react';
import Notification, { NotificationType, NotificationPosition } from '@/components/ui/toast';
import { AnimatePresence } from 'framer-motion';

interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message?: string;
  showIcon?: boolean;
  duration?: number;
  position?: NotificationPosition;
}

interface ToastContextType {
  showToast: (
    type: NotificationType,
    title: string,
    message?: string,
    showIcon?: boolean,
    duration?: number,
    position?: NotificationPosition
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const nextIdRef = useRef(1);

  const showToast = (
    type: NotificationType,
    title: string,
    message?: string,
    showIcon: boolean = true,
    duration: number = 3000,
    position: NotificationPosition = 'top-right'
  ) => {
    const id = nextIdRef.current++;
    const newNotification: NotificationItem = {
      id,
      type,
      title,
      message,
      showIcon,
      duration,
      position
    };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const handleClose = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getPositionClasses = (position: NotificationPosition) => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const grouped = notifications.reduce<Record<NotificationPosition, NotificationItem[]>>((acc, n) => {
    const pos = n.position || 'top-right';
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(n);
    return acc;
  }, {} as any);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {Object.entries(grouped).map(([pos, items]) => (
        <div
          key={pos}
          className={`fixed z-50 space-y-2 w-full max-w-sm ${getPositionClasses(pos as NotificationPosition)}`}
        >
          <AnimatePresence>
            {items.map((n) => (
              <Notification
                key={n.id}
                type={n.type}
                title={n.title}
                message={n.message}
                showIcon={n.showIcon}
                duration={n.duration}
                onClose={() => handleClose(n.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      ))}
    </ToastContext.Provider>
  );
};

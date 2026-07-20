"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPusherClient } from "@/lib/pusher-client";

export interface PusherNotificationEvent {
  channel: string;
  event: string;
  data: any;
  timestamp: number;
}

interface UsePusherNotificationsOptions {
  role: "client" | "business" | "worker" | "admin";
  userId?: string;
  businessId?: string;
  enabled?: boolean;
  onNotification?: (notification: PusherNotificationEvent) => void;
}

/**
 * Global hook that subscribes to role-based Pusher channels
 * and shows browser Notification API toasts.
 *
 * Channels:
 *  - business: `business-{userId}` → kyc-update, new-order, order-status-update
 *  - client: `client-{userId}` → order-status-update, dispute-update
 *  - worker: `business-{businessId}` → new-order, order-status-update
 *  - admin: `admin-orders`, `admin-disputes`, `platform-announcements`
 */
export function usePusherNotifications({
  role,
  userId,
  businessId,
  enabled = true,
  onNotification,
}: UsePusherNotificationsOptions) {
  const [latestNotification, setLatestNotification] =
    useState<PusherNotificationEvent | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const subscribedChannelsRef = useRef<string[]>([]);
  const onNotificationRef = useRef(onNotification);
  onNotificationRef.current = onNotification;

  // Request browser notification permission on mount
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    if (Notification.permission === "granted") {
      setPermissionGranted(true);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        setPermissionGranted(perm === "granted");
      });
    }
  }, [enabled]);

  const showBrowserNotification = useCallback(
    (title: string, body: string, data?: any) => {
      if (!permissionGranted) return;
      try {
        const notification = new Notification(title, {
          body,
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          tag: `uscor-${Date.now()}`,
          data,
        });
        notification.onclick = () => {
          window.focus();
          notification.close();
          if (onNotificationRef.current && data) {
            onNotificationRef.current(data);
          }
        };
      } catch {
        // Notification API might not be available in all contexts
      }
    },
    [permissionGranted],
  );

  const handlePusherEvent = useCallback(
    (channel: string, event: string, data: any) => {
      const notification: PusherNotificationEvent = {
        channel,
        event,
        data,
        timestamp: Date.now(),
      };
      setLatestNotification(notification);
      onNotificationRef.current?.(notification);

      // Show browser notification based on event type
      switch (event) {
        case "new-announcement":
          showBrowserNotification(
            "USCOR Announcement",
            data.title || "New platform announcement",
            notification,
          );
          break;

        case "kyc-update":
          if (data.status === "VERIFIED") {
            showBrowserNotification(
              "KYC Approved!",
              data.message || "Your business verification has been approved.",
              notification,
            );
          } else if (data.status === "REJECTED") {
            showBrowserNotification(
              "KYC Rejected",
              data.message || `Reason: ${data.reason || "See details in your dashboard."}`,
              notification,
            );
          }
          break;

        case "order-ready-for-shipment":
          showBrowserNotification(
            "Order Ready for Pickup",
            `Order #${data.orderRef} from ${data.businessName} is ready for shipment. ${data.itemCount} items, $${data.total?.toFixed(2)}.`,
            notification,
          );
          break;

        case "order-status-update": {
          const statusMessages: Record<string, string> = {
            PROCESSING: `Order #${data.orderRef} is now being processed.`,
            READY_FOR_SHIPMENT: `Order #${data.orderRef} is ready for shipment.`,
            SHIPPED: `Order #${data.orderRef} has been shipped!`,
            DELIVERED: `Order #${data.orderRef} has been delivered!`,
            COMPLETED: `Order #${data.orderRef} is complete!`,
            CANCELLED: `Order #${data.orderRef} has been cancelled.`,
          };
          showBrowserNotification(
            "Order Update",
            statusMessages[data.status] || `Order #${data.orderRef} status: ${data.status}`,
            notification,
          );
          break;
        }

        case "new-order-chat":
          showBrowserNotification(
            "New Order Chat",
            data.businessName
              ? `Order chat created with ${data.businessName}`
              : `New order chat for #${data.orderRef}`,
            notification,
          );
          break;

        case "new-dispute":
          showBrowserNotification(
            "New Dispute Filed",
            data.title || "A new dispute has been submitted.",
            notification,
          );
          break;

        case "dispute-update":
          showBrowserNotification(
            "Dispute Update",
            data.message || "A dispute has been updated.",
            notification,
          );
          break;

        default:
          break;
      }
    },
    [showBrowserNotification],
  );

  // Subscribe to Pusher channels based on role
  useEffect(() => {
    if (!enabled || !role) return;

    let pusher: any;
    try {
      pusher = getPusherClient();
    } catch {
      return;
    }

    const channels: string[] = [];

    switch (role) {
      case "business":
        if (userId) channels.push(`business-${userId}`);
        break;
      case "client":
        if (userId) channels.push(`client-${userId}`);
        break;
      case "worker":
        if (businessId) channels.push(`business-${businessId}`);
        if (userId) channels.push(`client-${userId}`); // worker might also get personal notifications
        break;
      case "admin":
        channels.push("admin-orders", "admin-disputes", "platform-announcements");
        break;
    }

    // Also subscribe to announcements for all authenticated roles
    if (role !== "admin") {
      channels.push("platform-announcements");
    }

    const events = [
      "new-announcement",
      "kyc-update",
      "order-status-update",
      "order-ready-for-shipment",
      "new-order-chat",
      "new-dispute",
      "dispute-update",
    ];

    // Subscribe and bind events
    for (const channelName of channels) {
      const channel = pusher.subscribe(channelName);
      for (const eventName of events) {
        channel.bind(eventName, (data: any) => {
          handlePusherEvent(channelName, eventName, data);
        });
      }
    }

    subscribedChannelsRef.current = channels;

    return () => {
      for (const channelName of channels) {
        try {
          pusher.unsubscribe(channelName);
        } catch {
          // Channel might already be unsubscribed
        }
      }
      subscribedChannelsRef.current = [];
    };
  }, [enabled, role, userId, businessId, handlePusherEvent]);

  return {
    latestNotification,
    permissionGranted,
    subscribedChannels: subscribedChannelsRef.current,
  };
}

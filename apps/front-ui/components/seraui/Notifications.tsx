"use client";

import { GET_CHAT_NOTIFICATIONS } from "@/graphql/chat.gql";
import { useMe } from "@/lib/useMe";
import { useQuery } from "@apollo/client";
import { Bell, MessageCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function NotificationsPopover() {
  const { user, role } = useMe();
  const userId = user?.id;
  const { data, loading } = useQuery(GET_CHAT_NOTIFICATIONS, {
    variables: { userId },
    skip: !userId,
  });
  const allItems = data?.chatNotifications || [];
  const items = (allItems || []).filter((n: any) => (n.unreadCount ?? 0) > 0);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const buildLink = (r: string | undefined, chatId: string) => {
    if (r === "business") return `/business/dashboard/chats?notif_chat_id=${chatId}`;
    if (r === "client") return `/marketplace/chat?notif_chat_id=${chatId}`;
    if (r === "worker") return `/worker/chats?notif_chat_id=${chatId}`;
    return `/chats?notif_chat_id=${chatId}`;
  };

  const baseRoute = (r: string | undefined) => {
    if (r === "business") return `/business/dashboard/chats`;
    if (r === "client") return `/marketplace/chat`;
    if (r === "worker") return `/worker/dashboard/chats`;
    return `/chats`;
  };

  const handleClick = (chatId: string) => {
    const base = baseRoute(role ?? undefined);
    if (pathname?.startsWith(base)) {
      const url = new URL(window.location.href);
      url.searchParams.set("notif_chat_id", chatId);
      router.push(url.pathname + url.search);
    } else {
      router.push(buildLink(role ?? undefined, chatId));
    }
    setOpen(false);
  };

  const totalUnread = items.reduce(
    (s: number, n: any) => s + (n.unreadCount ?? 0),
    0,
  );

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString();
  };

  if (!userId) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors"
        aria-expanded={open}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold leading-none px-1">
            {totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl shadow-black/5 dark:shadow-black/30 overflow-hidden z-50 animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Notifications
            </h4>
            {totalUnread > 0 && (
              <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
                {totalUnread} new
              </span>
            )}
          </div>

          {/* Items */}
          <div className="max-h-72 overflow-y-auto">
            {loading && (
              <div className="p-4 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && items.length === 0 && (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No new notifications</p>
              </div>
            )}
            {!loading &&
              items.map((n: any) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n.chatId)}
                  className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-0"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <MessageCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                      New message in chat
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(n.createdAt)}
                      </span>
                      {n.unreadCount > 1 && (
                        <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                          {n.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationsPopover;

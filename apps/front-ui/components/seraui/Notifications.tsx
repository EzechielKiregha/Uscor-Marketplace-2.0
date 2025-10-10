"use client"
import { useQuery } from '@apollo/client';
import { GET_CHAT_NOTIFICATIONS } from '@/graphql/chat.gql';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/seraui/PopOver';
import { useMe } from '@/lib/useMe';
import { Bell } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

function NotificationsPopover() {
  const { user, role } = useMe();
  const userId = user?.id;
  const { data, loading } = useQuery(GET_CHAT_NOTIFICATIONS, { variables: { userId }, skip: !userId });
  const allItems = data?.chatNotifications || [];

  // Filter out notifications that have no unread messages
  const items = (allItems || []).filter((n: any) => (n.unreadCount ?? 0) > 0);

  // Helper to build link based on role
  const buildLink = (r: string | undefined, chatId: string) => {
    if (r === 'business') return `/business/dashboard/chats/${chatId}`;
    if (r === 'client') return `/marketplace/chat/${chatId}`;
    if (r === 'worker') return `/worker/dashboard/chats/${chatId}`;
    return `/chats/${chatId}`;
  };

  // Base route for role (used to decide whether to add query param instead of full redirect)
  const baseRoute = (r: string | undefined) => {
    if (r === 'business') return `/business/dashboard/chats`;
    if (r === 'client') return `/marketplace/chat`;
    if (r === 'worker') return `/worker/dashboard/chats`;
    return `/chats`;
  };

  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (chatId: string) => {
    const base = baseRoute(role ?? undefined);
    // If user is already on the chats base route, push a query param instead of navigating away
    if (pathname && pathname.startsWith(base)) {
      // preserve existing pathname and set notif_chat_id param
      const url = new URL(window.location.href);
      url.searchParams.set('notif_chat_id', chatId);
      router.push(url.pathname + url.search);
      return;
    }

    // otherwise navigate to the chat route
    router.push(buildLink(role ?? undefined, chatId));
  };

  // Total unread notifications count (sum of unreadCounts)
  const totalUnread = items.reduce((s: number, n: any) => s + (n.unreadCount ?? 0), 0);

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      // show only hour:minute for today's notifications
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString();
  };

  return (
    <Popover>
      <PopoverTrigger>
        <div className="relative cursor-pointer p-2 rounded hover:bg-primary/50">
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && <span className="absolute -top-1 -right-1 text-xs bg-destructive text-white px-1 rounded-full">{totalUnread}</span>}
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-2">
          <h4 className="font-semibold">Notifications</h4>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {loading && <div className="p-3">Loading...</div>}
          {!loading && items.length === 0 && <div className="p-3 text-sm text-muted-foreground">No notifications</div>}
          {!loading && items.map((n: any) => (
            <div key={n.id} role="button" tabIndex={0} onClick={() => handleClick(n.chatId)} onKeyDown={(e) => { if (e.key === 'Enter') handleClick(n.chatId); }} className="block px-3 py-2 hover:bg-muted/50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="text-sm truncate">New message in chat {n.chatId}</div>
                <div className="text-xs text-gray-400">{formatDate(n.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationsPopover;
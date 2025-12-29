"use client"
import { ChatEntity, BusinessEntity, ClientEntity } from '@/lib/types';
import React from 'react';
import ScrollArea from '../ui/ScrollArea';
import { useQuery } from '@apollo/client';
import { GET_UNREAD_COUNT } from '@/graphql/chat.gql';
import { useMe } from '@/lib/useMe';

interface ChatListProps {
  chats: any[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  userRole: 'business' | 'client' | 'worker' | 'admin';
}


export default function ChatList({ chats, activeChatId, onSelect, userRole }: ChatListProps) {
  const { user, role, loading: meLoading } = useMe();
  const userId = user?.id;

  const { data: unreadData } = useQuery(GET_UNREAD_COUNT, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'network-only',
  });

  // Build unread map and total
  const unreadMap: Record<string, number> = {};
  let totalUnread = 0;
  if (unreadData?.unreadChatCount) {
    totalUnread = unreadData.unreadChatCount.totalUnread || 0;
    (unreadData.unreadChatCount.chatsWithUnread || []).forEach((c: any) => {
      unreadMap[c.chatId] = c.unreadCount || 0;
    });
  }

  // Sort chats: unread first (higher unread count first), then by newest
  const sortedChats = chats.slice().sort((a: any, b: any) => {
    const ua = unreadMap[a.id] || 0;
    const ub = unreadMap[b.id] || 0;
    if (ua !== ub) return ub - ua; // higher unread first

    // Determine last message timestamp (use messages[0] if messages are sorted desc, otherwise compute max)
    const getLastMsgTime = (c: any) => {
      if (!c) return 0;
      if (c.messages && c.messages.length > 0) {
        // find newest message by createdAt
        let max = 0;
        c.messages.forEach((m: any) => {
          const t = new Date(m.createdAt || 0).getTime();
          if (t > max) max = t;
        });
        if (max > 0) return max;
      }
      return new Date(c.updatedAt || c.createdAt || 0).getTime();
    };

    const da = getLastMsgTime(a);
    const db = getLastMsgTime(b);
    return db - da;
  });
  // Helper to get the main participant for display
  function getMainParticipant(chat: ChatEntity): { name: string; avatar?: string } {
    // console.log('Chat participants:', chat.participants);

    if (chat.participants && chat.participants.length > 0) {
      if (userRole === 'business') {
        const clientPart = chat.participants.find(p => p.client);
        if (clientPart && clientPart.client) {
          return { name: clientPart.client.fullName || clientPart.client.username || 'Client', avatar: (clientPart.client as any).avatar };
        }
      } else if (userRole === 'client') {
        const businessPart = chat.participants.find(p => p.business);
        if (businessPart && businessPart.business) {
          return { name: businessPart.business.name || 'Business', avatar: businessPart.business.avatar };
        }
      }
      // Fallback: show first participant
      const first = chat.participants[0];
      if (first.client) return { name: first.client.fullName || first.client.username || 'Client', avatar: (first.client as any).avatar };
      if (first.business) return { name: first.business.name || 'Business', avatar: first.business.avatar };
      if (first.worker) return { name: first.worker.fullName || 'Worker', avatar: undefined };
    }
    return { name: 'Chat', avatar: undefined };
  }

  return (
    // Make this a flex column child that can shrink/grow so it works inside responsive layouts
    <div className="flex-1 bg-card min-h-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="font-semibold">Messages</div>
        {totalUnread > 0 && (
          <div className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
            {totalUnread}
          </div>
        )}
      </div>
      <ScrollArea className="h-full min-h-0 overflow-y-auto overflow-x-hidden">
        {sortedChats.map(chat => {
          const participant = getMainParticipant(chat);
          return (
            <div
              key={chat.id}
              className={`p-2 sm:p-3 md:p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors duration-150 ${activeChatId === chat.id ? 'bg-muted' : ''}`}
              onClick={() => onSelect(chat.id)}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <img
                  src={participant.avatar || "avatar.png"}
                  alt={participant.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                  onError={event => {
                    event.currentTarget.src = `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(participant.name.charAt(0))}`;
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate text-sm sm:text-base md:text-lg">{participant.name} <span className='text-orange-600 text-xs sm:text-sm'>{chat.product?.title}</span></div>
                  <div className="text-xs sm:text-sm text-gray-500 truncate">{chat.service?.description || chat.product?.description || ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  {unreadMap[chat.id] > 0 && (
                    <div className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
                      {unreadMap[chat.id]}
                    </div>
                  )}
                  <div className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">{new Date(chat.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          );
        })}
      </ScrollArea>
      {chats.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-muted-foreground">You don't have any messages to display</p>
        </div>
      )}
    </div>
  );
}

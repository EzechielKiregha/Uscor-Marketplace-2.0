import { ChatEntity, BusinessEntity, ClientEntity } from '@/lib/types';
import React from 'react';

interface ChatListProps {
  chats: any[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  userRole: 'business' | 'client' | 'worker';
}


export default function ChatList({ chats, activeChatId, onSelect, userRole }: ChatListProps) {
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
    <div className="flex-1 bg-card overflow-y-auto">
      {chats.map(chat => {
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
              <div className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">{new Date(chat.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        );
      })}
      {chats.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No messages yet</h3>
          <p className="text-muted-foreground">You don't have any messages to display</p>
        </div>
      )}
    </div>
  );
}

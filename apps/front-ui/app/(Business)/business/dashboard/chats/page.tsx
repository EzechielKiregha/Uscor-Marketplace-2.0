// app/business/chats/page.tsx
'use client';

import { useQuery, useSubscription } from '@apollo/client';
import { GET_CHATS, ON_MESSAGE_RECEIVED } from '@/graphql/chat.gql';
import Loader from '@/components/seraui/Loader';
import { MessageSquare, Search, MoreVertical, User, Package } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import ChatThread from './_components/ChatThread';
import { useOpenChatThreadModal } from '../../_hooks/use-open-chat-thread-modal';

export default function BusinessChatsPage() {
  const { isOpen, setIsOpen } = useOpenChatThreadModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);

  const { data, loading, error, refetch } = useQuery(GET_CHATS, {
    variables: {
      businessId: 'current-business-id',
      search: searchTerm
    }
  });

  useSubscription(ON_MESSAGE_RECEIVED, {
    variables: { chatId: activeChatId || '' },
    onData: ({ client, data }) => {  // Changed from subscriptionData to data
      if (data.data?.messageReceived) {
        // Update the specific chat with the new message
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === activeChatId
              ? {
                ...chat,
                messages: [...chat.messages, data.data.messageReceived],
                updatedAt: new Date().toISOString()
              }
              : chat
          )
        );

        // Also update the chat list to show the new message count
        refetch();
      }
    }
  });

  useEffect(() => {
    if (data?.chats?.items) {
      setChats(data.chats.items);
    }
  }, [data]);

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
    setIsOpen({ openChatThreadModal: true, chatId });
  };

  if (loading) return <Loader loading={true} />;
  if (error) return <div>Error loading chats</div>;

  return (
    <div className="flex h-[calc(100vh-120px)] max-h-[calc(100vh-120px)] overflow-hidden">
      {/* Chat List */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 ${activeChatId === chat.id ? 'bg-muted' : ''
                }`}
              onClick={() => handleChatSelect(chat.id)}
            >
              <div className="flex items-start gap-3">
                {chat.client.avatar ? (
                  <img
                    src={chat.client.avatar}
                    alt={chat.client.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
                    {chat.client.fullName.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate">{chat.client.fullName}</h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    {chat.product ? (
                      <>
                        <Package className="h-3 w-3 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.product.title}
                        </p>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-3 w-3 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">
                          {chat.messages[chat.messages.length - 1]?.content.substring(0, 30)}...
                        </p>
                      </>
                    )}
                  </div>

                  {chat.unreadCount > 0 && (
                    <span className="mt-1 inline-block bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {chats.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-muted-foreground">You don't have any messages to display</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Thread */}
      <div className="flex-1 flex flex-col">
        {activeChatId ? (
          <ChatThread chatId={activeChatId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-muted/50">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
            <p className="text-muted-foreground">Click on a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
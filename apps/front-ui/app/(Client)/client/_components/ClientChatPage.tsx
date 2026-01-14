'use client';

import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { GET_CHATS, ON_MESSAGE_RECEIVED, SEND_MESSAGE } from '@/graphql/chat.gql';
import Loader from '@/components/seraui/Loader';
import { MessageSquare, Search, MoreVertical, Package, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useState, useEffect } from 'react';
import ChatThread from '@/components/chat/ChatThread';
import ChatList from '@/components/chat/ChatList';
import { useMe } from '@/lib/useMe';
import { Button } from '@/components/ui/button';


interface OrderHistoryProps {
  client: any;
}

export default function ClientChatsPage({ client }: OrderHistoryProps) {
  // const { isOpen, setIsOpen } = useOpenChatThreadModal();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [showChatList, setShowChatList] = useState(true);

  // Add the sendMessage mutation
  const [sendMessage] = useMutation(SEND_MESSAGE);

  const { data, loading, error, refetch } = useQuery(GET_CHATS, {
    variables: {
      clientId: client?.id,
      search: searchTerm
    },
    skip: !client?.id
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
      // check for notif_chat_id in query string
      try {
        const url = new URL(window.location.href);
        const notif = url.searchParams.get('notif_chat_id');
        if (notif) {
          setActiveChatId(notif);
          return;
        }
      } catch (e) {
        // ignore parsing errors
      }
      setActiveChatId(data.chats.items[0]?.id || null); // Set the first chat as active by default
    }
  }, [data]);

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
    // setIsOpen({ openChatThreadModal: true, chatId });
    // On mobile, hide chat list when a chat is selected
    setShowChatList(false);
  };

  const handleBackToList = () => {
    setShowChatList(true);
    setActiveChatId(null);
  };

  if (loading) {
    return (
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chats ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card border border-orange-400/60 dark:border-orange-500/70 rounded-lg p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-1">Error Loading Orders</h3>
          <p className="text-muted-foreground mb-6">
            {error.message}
          </p>

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] max-h-[90vh] overflow-hidden rounded-2xl border border-orange-400/60 dark:border-orange-500/70 bg-card">
      {/* Chat List */}
      <div className={`${showChatList ? 'flex' : 'hidden'} md:flex w-full md:w-auto md:max-w-md border-r border-border flex-col`}>
        <div className="p-4 border-b border-border bg-background">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-orange-400/60 dark:border-orange-500/70 bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <ChatList
          chats={chats}
          activeChatId={activeChatId}
          onSelect={handleChatSelect}
          userRole="client"
        />
      </div>
      {/* Chat Thread */}
      <div className={`${!showChatList ? 'flex' : 'hidden'} md:flex flex-1 flex flex-col min-h-0`}>
        {activeChatId ? (
          <ChatThread
            chat={chats.find(c => c.id === activeChatId)}
            userId={client?.id || ''}
            userRole="client"
            onSendMessage={async (content) => {
              // mimic handleSendMessage logic
              await sendMessage({
                variables: {
                  input: {
                    chatId: activeChatId,
                    content,
                    senderType: 'CLIENT',
                    senderId: client?.id
                  }
                }
              });
              refetch();
            }}
            loading={loading}
            onBack={handleBackToList}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-muted/50 p-4">
            <MessageSquare className="h-12 md:h-16 w-12 md:w-16 text-muted-foreground mb-4" />
            <h2 className="text-lg md:text-xl font-semibold mb-2 text-center">Select a conversation</h2>
            <p className="text-muted-foreground text-center text-sm md:text-base">Click on a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
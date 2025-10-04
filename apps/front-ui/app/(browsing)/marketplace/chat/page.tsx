'use client';
import HeaderComponent from "@/components/seraui/HeaderComponent";
import ChatList from '@/components/chat/ChatList';
import ChatThread from '@/components/chat/ChatThread';
import { Menu, MessageSquare } from 'lucide-react';
import Footer from "@/components/seraui/FooterSection";
import { useMe } from "@/lib/useMe";
import Loader from "@/components/seraui/Loader";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import { GET_CHAT_BY_ID, GET_CHATS_BY_PARTICIPANT, SEND_MESSAGE } from "@/graphql/chat.gql";

export default function ChatThreadListPage() {
  const user = useMe();
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null);
  const [chats, setChats] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const params = useSearchParams();
  const currentId = params.get('currentId');
  const { loading, error, data, refetch } = useQuery(GET_CHATS_BY_PARTICIPANT, {
    variables: { participantId: user?.id },
    skip: !user?.id,
  });
  // Add the sendMessage mutation
  const [sendMessage] = useMutation(SEND_MESSAGE);

  const [currentChat, setCurrentChat] = React.useState<any>(null);

  const { data: chatData } = useQuery(GET_CHAT_BY_ID, {
    variables: { id: currentId },
  });

  React.useEffect(() => {
    if (data?.chatsByParticipant) setChats(data.chatsByParticipant);
    if (currentId) setActiveChatId(currentId);
    if (chatData?.chat) setCurrentChat(chatData.chat);
  }, [data, currentId, chatData]);

  if (loading) {
    return <Loader loading={true} />;
  }
  if (error) {
    console.error(error);
    return <div>Error fetching chats.</div>;
  }

  // Responsive: show drawer on mobile, sidebar on desktop
  return (
    <div className=" flex flex-col min-h-screen bg-background dark:bg-gray-950 text-foreground">
      <HeaderComponent />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Drawer Button */}
        <button
          className="lg:hidden absolute items-end top-4 left-4 z-20 bg-primary text-white p-2 rounded-full shadow-lg"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open chat list"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Chat List Drawer (mobile) */}
        {drawerOpen && (
          <div className="fixed inset-0 z-30 bg-black/40 flex">
            <div className="w-4/5 max-w-xs bg-background dark:bg-gray-900 h-full shadow-xl flex flex-col">
              <div className="p-4 border-b border-border flex justify-between items-center">
                <span className="font-bold text-lg">Chats</span>
                <button onClick={() => setDrawerOpen(false)} className="text-2xl">×</button>
              </div>
              <div className="p-4 border-b border-border">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-3 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <ChatList
                chats={chats}
                activeChatId={activeChatId}
                onSelect={(id) => {
                  setActiveChatId(id);
                  setDrawerOpen(false);
                }}
                userRole="client"
              />
            </div>
            <div className="flex-1" onClick={() => setDrawerOpen(false)} />
          </div>
        )}

        {/* Chat List Sidebar (desktop) */}
        <div className="hidden bg-card lg:flex w-80 border-r border-border flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
          <ChatList
            chats={chats}
            activeChatId={activeChatId}
            onSelect={setActiveChatId}
            userRole={user.role || 'client'}
          />
        </div>

        {/* Chat Thread */}
        <div className="flex-1 flex-col">
          {activeChatId ? (
            <ChatThread
              chat={chats.find(c => c.id === activeChatId) || currentChat}
              userId={user?.id || ''}
              userRole={user.role || 'client'}
              onSendMessage={async (content) => {
                await sendMessage({
                  variables: {
                    input: {
                      chatId: activeChatId,
                      content,
                      senderType: 'CLIENT',
                      senderId: user?.id
                    }
                  }
                });
                refetch();
              }}
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
      {/* <Footer /> */}
    </div>
  );
}
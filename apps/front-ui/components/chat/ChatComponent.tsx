// app/chat/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  MessageSquare,
  Search,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/toast-provider";
import { GET_CHATS } from "@/graphql/chat.gql";
import { useMe } from "@/lib/useMe";
import ChatModal from "./ChatModal";

export default function ChatPage() {
  const { user, role, loading: authLoading } = useMe();
  const { showToast } = useToast();
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatType, setChatType] = useState<
    "client" | "worker" | "business" | null
  >(null);

  // Determine chat type based on user role
  useEffect(() => {
    if (role === "client") {
      setChatType("client");
    } else if (role === "worker") {
      setChatType("worker");
    } else if (role === "business") {
      setChatType("business");
    }
  }, [role]);

  const {
    data: chatsData,
    loading: chatsLoading,
    error: chatsError,
    refetch,
  } = useQuery(GET_CHATS, {
    variables: {
      [chatType === "client"
        ? "clientId"
        : chatType === "worker"
          ? "workerId"
          : "businessId"]: user?.id,
      search: searchTerm,
    },
    skip: !user?.id || !chatType,
    pollInterval: 10000,
  });

  useEffect(() => {
    // Auto-open chat modal for new users after a delay
    if (!authLoading && !user && !isChatModalOpen) {
      const timer = setTimeout(() => {
        setIsChatModalOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [authLoading, user, isChatModalOpen]);

  const handleChatCreated = (chatId: string) => {
    setActiveChatId(chatId);
    setIsChatModalOpen(true);
    refetch();
  };

  const handleChatClose = () => {
    setIsChatModalOpen(false);
    setActiveChatId(null);
  };

  const handleChatSelect = (chatId: string) => {
    setActiveChatId(chatId);
    setIsChatModalOpen(true);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Loading Chat</h2>
          <p className="text-muted-foreground">
            Please wait while we prepare your conversations
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Chat with USCOR</h1>
              <p className="text-muted-foreground">
                Connect with businesses, clients, or workers
              </p>
            </div>
            <Button variant="outline" onClick={() => setIsChatModalOpen(true)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Start Chat
            </Button>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Welcome to USCOR Chat
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Sign in to access your conversations based on your account type
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  className="bg-primary hover:bg-accent text-primary-foreground h-11 px-6"
                  onClick={() => {
                    const currentPath = encodeURIComponent(
                      window.location.pathname,
                    );
                    window.location.href = `/login?redirect=${currentPath}`;
                  }}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Sign In to Chat
                </Button>

                <Button
                  variant="outline"
                  className="h-11 px-6"
                  onClick={() => setIsChatModalOpen(true)}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Explore Chat Features
                </Button>
              </div>
            </div>
          </div>

          {/* Floating chat for welcome experience */}
          {/* <FloatingChat /> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            {chatType === "client" && (
              <>
                <h1 className="text-2xl font-bold">Client Conversations</h1>
                <p className="text-muted-foreground">
                  Connect with businesses for purchases and services
                </p>
              </>
            )}
            {chatType === "worker" && (
              <>
                <h1 className="text-2xl font-bold">Worker Conversations</h1>
                <p className="text-muted-foreground">
                  Manage conversations with clients and businesses
                </p>
              </>
            )}
            {chatType === "business" && (
              <>
                <h1 className="text-2xl font-bold">Business Conversations</h1>
                <p className="text-muted-foreground">
                  Manage conversations with clients and workers
                </p>
              </>
            )}
          </div>
          <Button
            className="bg-primary hover:bg-accent text-primary-foreground"
            onClick={() => setIsChatModalOpen(true)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>

        {chatsError ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Error Loading Conversations
            </h3>
            <p className="text-muted-foreground mb-6">
              {chatsError.message ||
                "Failed to load your conversations. Please try again later."}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Try Again
            </Button>
          </div>
        ) : chatsLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 border-b border-border animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div className="h-3 bg-muted rounded w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : chatsData?.chats?.items?.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
            <p className="text-muted-foreground mb-6">
              {chatType === "client" &&
                "Start a new conversation to connect with businesses"}
              {chatType === "worker" &&
                "Start a new conversation to connect with clients and businesses"}
              {chatType === "business" &&
                "Start a new conversation to connect with clients and workers"}
            </p>
            <Button
              className="bg-primary hover:bg-accent text-primary-foreground"
              onClick={() => setIsChatModalOpen(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Start New Conversation
            </Button>
          </div>
        ) : (
          <div className="relative">
            {/* Search */}
            <div className="relative mb-4">
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>

            {/* Chat List */}
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-1">
                {chatsData?.chats?.items?.map((chat: any) => {
                  const lastMessage = chat.messages?.[chat.messages.length - 1];
                  const unreadCount = chat.unreadCount || 0;

                  return (
                    <div
                      key={chat.id}
                      className="p-4 cursor-pointer border-b border-border hover:bg-muted/50 rounded-lg transition-colors"
                      onClick={() => handleChatSelect(chat.id)}
                    >
                      <div className="flex items-center gap-3">
                        {chatType === "client" && chat.business?.avatar ? (
                          <img
                            src={chat.business.avatar}
                            alt={chat.business.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : chatType === "business" && chat.client?.avatar ? (
                          <img
                            src={chat.client.avatar}
                            alt={chat.client.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : chatType === "worker" &&
                          (chat.client?.avatar || chat.business?.avatar) ? (
                          <img
                            src={chat.client?.avatar || chat.business?.avatar}
                            alt={chat.client?.fullName || chat.business?.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">
                              {chatType === "client" &&
                                (chat.business?.name?.charAt(0) || "B")}
                              {chatType === "business" &&
                                (chat.client?.fullName?.charAt(0) || "C")}
                              {chatType === "worker" &&
                                (chat.client?.fullName?.charAt(0) ||
                                  chat.business?.name?.charAt(0) ||
                                  "P")}
                            </span>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium truncate">
                                {chatType === "client" && chat.business?.name}
                                {chatType === "business" &&
                                  chat.client?.fullName}
                                {chatType === "worker" &&
                                  (chat.client?.fullName ||
                                    chat.business?.name)}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate mt-1 line-clamp-1">
                                {lastMessage ? (
                                  <>
                                    {lastMessage.senderType === "BUSINESS" &&
                                      "You: "}
                                    {lastMessage.senderType === "WORKER" &&
                                      "You: "}
                                    {lastMessage.content}
                                  </>
                                ) : (
                                  "No messages yet"
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground mb-1">
                                {lastMessage
                                  ? new Date(
                                      lastMessage.createdAt,
                                    ).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </p>
                              {unreadCount > 0 && (
                                <span className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs">
                                  {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 mt-1">
                            {chat.negotiationType === "REOWNERSHIP" && (
                              <span className="text-xs bg-warning/10 text-warning px-1.5 py-0.5 rounded-full">
                                Reownership
                              </span>
                            )}
                            {chat.negotiationType === "FREELANCE_ORDER" && (
                              <span className="text-xs bg-success/10 text-success px-1.5 py-0.5 rounded-full">
                                Freelance
                              </span>
                            )}
                            {chat.negotiationType === "PURCHASE" && (
                              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                                Purchase
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Chat Modal */}
        <ChatModal
          isOpen={isChatModalOpen}
          chatId={activeChatId!}
          onClose={handleChatClose}
        />

        {/* Floating Chat Button */}
        {/* <FloatingChat /> */}
      </div>
    </div>
  );
}

"use client";

import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  CheckCircle,
  MessageSquare,
  MoreVertical,
  Search,
  Send,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Loader from "@/components/seraui/Loader";
import { useToast } from "@/components/toast-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GET_CHAT_MESSAGES,
  GET_CHATS,
  ON_CHAT_STATUS_UPDATED,
  ON_MESSAGE_RECEIVED,
  SEND_MESSAGE,
} from "@/graphql/chat.gql";
import type {
  BusinessEntity,
  ChatEntity,
  ChatMessageEntity,
  ChatParticipantEntity,
  ClientEntity,
} from "@/lib/types";
import { useMe } from "@/lib/useMe";

type ChatMessageWithContentEntity = ChatMessageEntity & {
  content: string;
  senderType?: string;
  isRead?: boolean;
};

type TypedChatEntity = Omit<ChatEntity, "messages" | "negotiationType"> & {
  messages: ChatMessageWithContentEntity[];
  client?: ClientEntity;
  business?: BusinessEntity;
  unreadCount?: number;
  negotiationType?: ChatEntity["negotiationType"] | "FREELANCE_ORDER";
};

type ChatsPageProps = {
  viewMode?: "worker" | "business"; // New prop
  workerId?: string;
};

export default function ChatsPage({
  viewMode = "worker",
  workerId,
}: ChatsPageProps) {
  const { user, role } = useMe();
  const [selectedChat, setSelectedChat] = useState<TypedChatEntity | null>(
    null,
  );
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  const effectiveWorkerId =
    viewMode === "business" && workerId ? workerId : user?.id;

  const vars =
    role === "worker"
      ? {
          workerId: effectiveWorkerId,
          // businessId: "7659de10-20da-4819-9285-f220cb0b0940",
          status: filterStatus || undefined,
          negotiationType: filterType || undefined,
          search: searchQuery || undefined,
        }
      : role === "client"
        ? {
            clientId: effectiveWorkerId,
            status: filterStatus || undefined,
            negotiationType: filterType || undefined,
            search: searchQuery || undefined,
          }
        : role === "business"
          ? {
              businessId: effectiveWorkerId,
              status: filterStatus || undefined,
              negotiationType: filterType || undefined,
              search: searchQuery || undefined,
            }
          : {};

  const {
    data: chatsData,
    loading: chatsLoading,
    error: chatsError,
    refetch: refetchChats,
  } = useQuery(GET_CHATS, {
    variables: vars,
    skip: !effectiveWorkerId,
  });

  const {
    data: messagesData,
    loading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery(GET_CHAT_MESSAGES, {
    variables: {
      chatId: selectedChat?.id,
      limit: 50,
    },
    skip: !selectedChat?.id,
  });

  const [sendMessageMutation] = useMutation(SEND_MESSAGE);

  // Handle real-time message updates
  useSubscription(ON_MESSAGE_RECEIVED, {
    variables: { chatId: selectedChat?.id || "" },
    skip: !selectedChat?.id,
    onData: ({ data }) => {
      if (data.data?.messageReceived?.chatId === selectedChat?.id) {
        refetchMessages();
        refetchChats();
      }
    },
  });

  // Handle real-time chat updates
  useSubscription(ON_CHAT_STATUS_UPDATED, {
    variables: { userId: effectiveWorkerId || "" },
    skip: !effectiveWorkerId,
    onData: ({ data }) => {
      if (data.data?.chatStatusUpdated) {
        refetchChats();
      }
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    try {
      await sendMessageMutation({
        variables: {
          input: {
            chatId: selectedChat.id,
            content: messageInput,
            senderType: "WORKER",
            senderId: effectiveWorkerId,
          },
        },
      });

      setMessageInput("");
      refetchMessages();
      refetchChats();
    } catch (error: any) {
      showToast("error", "Error", error.message || "Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
            Pending
          </span>
        );
      case "ACTIVE":
        return (
          <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
            Active
          </span>
        );
      case "CLOSED":
        return (
          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
            Closed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
            {status}
          </span>
        );
    }
  };

  const chatParticipants: ChatParticipantEntity[] = (
    (chatsData?.chats?.items || []) as ChatEntity[]
  ).flatMap((chat) => chat.participants || []);

  const typedChats = ((chatsData?.chats?.items || []) as ChatEntity[]).map(
    (chat) => {
      const clientParticipant = chat.participants?.find(
        (participant) => participant.client,
      )?.client;
      const businessParticipant = chat.participants?.find(
        (participant) => participant.business,
      )?.business;

      return {
        ...chat,
        messages: (chat.messages || []) as ChatMessageWithContentEntity[],
        client: clientParticipant,
        business: businessParticipant,
        unreadCount: (chat as any).unreadCount,
        negotiationType:
          (chat.negotiationType as ChatEntity["negotiationType"]) ||
          (chat as any).negotiationType,
      };
    },
  ) as TypedChatEntity[];

  const filteredChats = typedChats.filter((chat) => {
    const participant = chatParticipants.find((p) => p.chatId === chat.id);
    const matchesSearch =
      !searchQuery ||
      participant?.client?.fullName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      participant?.business?.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      chat.messages?.some((msg) =>
        ((msg.content || msg.message) ?? "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );

    const matchesStatus = !filterStatus || chat.status === filterStatus;
    const matchesType = !filterType || chat.negotiationType === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (chatsLoading || messagesLoading) return <Loader loading={true} />;
  if (chatsError) return <div>Error loading chats: {chatsError.message}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Conversations</h1>
        <p className="text-muted-foreground">
          Manage conversations with customers and businesses
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 bg-muted border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative w-full sm:w-64">
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full sm:w-32 p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="ACTIVE">Active</option>
                  <option value="CLOSED">Closed</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full sm:w-32 p-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">All Types</option>
                  <option value="REOWNERSHIP">Reownership</option>
                  <option value="FREELANCE_ORDER">Freelance Order</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-border max-h-150 overflow-y-auto">
              {filteredChats.map((chat: TypedChatEntity) => {
                const lastMessage = chat.messages?.[chat.messages.length - 1];
                const unreadCount = chat.unreadCount || 0;

                return (
                  <div
                    key={chat.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedChat?.id === chat.id ? "bg-muted/70" : ""
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="flex items-start gap-3">
                      {chat.client?.avatar ? (
                        <img
                          src={chat.client.avatar}
                          alt={chat.client.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : chat.business?.avatar ? (
                        <img
                          src={chat.business.avatar}
                          alt={chat.business.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm">
                          {chat.client?.fullName?.charAt(0) ||
                            chat.business?.name?.charAt(0) ||
                            "U"}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium truncate">
                              {chat.client?.fullName ||
                                chat.business?.name ||
                                "Unknown"}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {chat.negotiationType === "REOWNERSHIP" && (
                                <span className="bg-warning/10 text-warning px-1.5 py-0.5 rounded text-xs">
                                  Reownership
                                </span>
                              )}
                              {chat.negotiationType === "FREELANCE_ORDER" && (
                                <span className="bg-success/10 text-success px-1.5 py-0.5 rounded text-xs">
                                  Freelance
                                </span>
                              )}
                              {chat.negotiationType === "PURCHASE" && (
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs">
                                  Purchase
                                </span>
                              )}
                              {chat.negotiationType === "GENERAL" && (
                                <span className="bg-muted px-1.5 py-0.5 rounded text-xs">
                                  General
                                </span>
                              )}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {lastMessage && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  lastMessage.createdAt,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            )}
                            {unreadCount > 0 && (
                              <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>

                        {lastMessage && (
                          <p className="text-sm text-muted-foreground truncate mt-1 line-clamp-1">
                            {lastMessage.senderType === "WORKER" ? "You: " : ""}
                            {lastMessage.content}
                          </p>
                        )}

                        <div className="flex items-center gap-1 mt-1">
                          {getStatusBadge(chat.status)}
                          {chat.product && (
                            <span className="text-xs bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShoppingCart className="h-3 w-3" />
                              {chat.product.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredChats.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  {searchQuery || filterStatus || filterType
                    ? "No matching conversations found"
                    : "No conversations yet"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Detail */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-150">
              {/* Chat Header */}
              <div className="p-4 bg-muted border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedChat.client?.avatar ? (
                    <img
                      src={selectedChat.client.avatar}
                      alt={selectedChat.client.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : selectedChat.business?.avatar ? (
                    <img
                      src={selectedChat.business.avatar}
                      alt={selectedChat.business.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm">
                      {selectedChat.client?.fullName?.charAt(0) ||
                        selectedChat.business?.name?.charAt(0) ||
                        "U"}
                    </div>
                  )}

                  <div>
                    <h3 className="font-medium">
                      {selectedChat.client?.fullName ||
                        selectedChat.business?.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedChat.client?.email ||
                        selectedChat.business?.email}
                    </p>
                  </div>

                  {selectedChat.product && (
                    <div className="ml-4 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedChat.product.title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedChat.status)}
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
                {messagesData?.chatMessages?.items?.map(
                  (message: ChatMessageWithContentEntity) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderType === "WORKER"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          message.senderType === "WORKER"
                            ? "bg-primary text-primary-foreground rounded-br-none rounded-lg"
                            : "bg-background rounded-bl-none rounded-lg"
                        }`}
                      >
                        <div className="p-3">
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                        <div className="px-3 pb-2 text-xs opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {message.senderType === "WORKER" &&
                            message.isRead && (
                              <span className="ml-1">
                                <CheckCircle className="h-3 w-3 inline" />
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  ),
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-muted border-t border-border">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden h-150 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Select a Conversation
                </h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

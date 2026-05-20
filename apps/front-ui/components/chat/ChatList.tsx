"use client";

import { useQuery } from "@apollo/client";
import { GET_CHATS, GET_UNREAD_COUNT } from "@/graphql/chat.gql";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Store,
  MessageCircle,
  CheckCircle,
  Clock,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "../ui/button";
import { useMe } from "@/lib/useMe";
import { useEffect, useState } from "react";
import BusinessTypeIcon from "@/app/(browsing)/marketplace/_components/BusinessTypeIcons";

interface ChatListProps {
  chats: any[];
  activeChatId: string | null;
  onSelect: (chatId: string) => void;
  userRole: "business" | "client" | "worker" | "admin" | null;
}

export default function ChatList({
  chats,
  activeChatId,
  onSelect,
  userRole,
}: ChatListProps) {
  const { user, role, loading: meLoading } = useMe();
  const userId = user?.id;
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: unreadData, refetch: refetchUnread } = useQuery(
    GET_UNREAD_COUNT,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
      // pollInterval: 5000,
    },
  );

  useEffect(() => {
    if (unreadData?.unreadCount) {
      setUnreadCount(unreadData.unreadCount);
    }
  }, [unreadData]);

  const {
    data: chatsData,
    loading: chatsLoading,
    refetch,
  } = useQuery(GET_CHATS, {
    variables: {
      [userRole === "business"
        ? "businessId"
        : userRole === "worker"
          ? "workerId"
          : "clientId"]: userId,
    },
    skip: !userId || !userRole,
    pollInterval: 10000,
  });

  const allChats = chatsData?.chats?.items || chats;

  const getChatUnreadCount = (chatId: string) => {
    return (
      unreadData?.chatsWithUnread?.filter((c: any) => c.chatId === chatId)?.[0]
        ?.unreadCount || 0
    );
  };

  const getMainParticipant = (chat: any) => {
    if (chat.participants && chat.participants.length > 0) {
      if (userRole === "business" || userRole === "worker") {
        const clientPart = chat.participants.find((p: any) => p.client);
        if (clientPart?.client) {
          return {
            name: clientPart.client.fullName || "Client",
            avatar: (clientPart.client as any).avatar,
            type: "client",
          };
        }
      } else if (userRole === "client") {
        const businessPart = chat.participants.find((p: any) => p.business);
        if (businessPart?.business) {
          return {
            name: businessPart.business.name || "Business",
            avatar: businessPart.business.avatar,
            type: "business",
            businessType: businessPart.business.businessType as string,
          };
        }
      }
    }
    return { name: "Unknown", avatar: null, type: "unknown" };
  };

  const getLastMessage = (chat: any) => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      return {
        content: lastMessage.content,
        isSender: lastMessage.senderId === userId,
        createdAt: lastMessage.createdAt,
      };
    }
    return {
      content: "No messages yet",
      isSender: false,
      createdAt: chat.createdAt,
    };
  };

  const getMessageStatusIcon = (chat: any) => {
    if (!chat.messages || chat.messages.length === 0) return null;

    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage.senderId !== userId) return null;

    if (lastMessage.isRead) {
      return <CheckCircle className="h-3 w-3 text-primary" />;
    } else if (lastMessage.status === "delivered") {
      return <CheckCircle className="h-3 w-3 text-muted-foreground" />;
    } else if (lastMessage.status === "pending") {
      return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
    return <CheckCircle className="h-3 w-3 text-muted-foreground" />;
  };

  if (chatsLoading || meLoading) {
    return (
      <div className="flex flex-col h-full">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-3 border-b border-border animate-pulse">
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
    );
  }

  if (allChats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">No conversations yet</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Start a new conversation to connect with businesses or clients
        </p>
        <Button className="bg-primary hover:bg-accent text-primary-foreground">
          <MessageCircle className="h-4 w-4 mr-2" />
          Start New Conversation
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1">
        {allChats.map((chat: any) => {
          const participant = getMainParticipant(chat);
          const lastMessage = getLastMessage(chat);

          return (
            <div
              key={chat.id}
              className={`p-3 cursor-pointer transition-colors rounded-lg ${
                activeChatId === chat.id ? "bg-muted/70" : "hover:bg-muted/50"
              }`}
              onClick={() => onSelect(chat.id)}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {participant.avatar ? (
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      {participant.type === "business" ? (
                        <Store className="h-5 w-5 text-primary" />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  )}
                  {getChatUnreadCount(chat.id) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                      {getChatUnreadCount(chat.id) > 9
                        ? "9+"
                        : getChatUnreadCount(chat.id)}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium truncate">
                        {participant.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        {participant.type === "business" && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                            {BusinessTypeIcon({
                              businessType: participant.businessType!,
                              className: "h-5 w-5 text-primary",
                            })}
                            {participant.businessType?.toUpperCase() ===
                              "ARTISAN" && "Artisan"}
                            {participant.businessType?.toUpperCase() ===
                              "BOOKSTORE" && "Bookstore"}
                            {participant.businessType?.toUpperCase() ===
                              "ELECTRONICS" && "Electronics"}
                            {participant.businessType?.toUpperCase() ===
                              "HARDWARE" && "Hardware"}
                            {participant.businessType?.toUpperCase() ===
                              "GROCERY" && "Grocery"}
                            {participant.businessType?.toUpperCase() ===
                              "CAFE" && "Café"}
                            {participant.businessType?.toUpperCase() ===
                              "RESTAURANT" && "Restaurant"}
                            {participant.businessType?.toUpperCase() ===
                              "RETAIL" && "Retail"}
                            {participant.businessType?.toUpperCase() ===
                              "BAR" && "Bar"}
                            {participant.businessType?.toUpperCase() ===
                              "CLOTHING" && "Clothing"}
                            {!participant.businessType?.toUpperCase() &&
                              "Business"}
                          </span>
                        )}
                        {chat.negotiationType === "REOWNERSHIP" && (
                          <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                            Reownership
                          </span>
                        )}
                        {chat.negotiationType === "FREELANCE_ORDER" && (
                          <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                            Freelance
                          </span>
                        )}
                        {chat.negotiationType === "PURCHASE" && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Purchase
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatDistanceToNow(new Date(lastMessage.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                      {getMessageStatusIcon(chat)}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground truncate mt-1 line-clamp-1">
                    {lastMessage.isSender && "You: "} {lastMessage.content}
                  </p>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

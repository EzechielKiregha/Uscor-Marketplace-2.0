// marketplace/_components/ChatThread.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useSubscription, useQuery } from "@apollo/client";
import {
  ArrowLeft,
  Send,
  Plus,
  X,
  Loader2,
  AlertCircle,
  MessageCircle,
  Store,
  User,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageBubble from "./MessageBubble";
import {
  GET_CHAT_BY_ID,
  SEND_MESSAGE,
  ON_MESSAGE_RECEIVED,
  MARK_MESSAGES_AS_READ,
  GET_UNREAD_COUNT,
} from "@/graphql/chat.gql";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMe } from "@/lib/useMe";
import BusinessTypeIcon from "@/app/(browsing)/marketplace/_components/BusinessTypeIcons";

interface ChatThreadProps {
  chatId: string;
  userId: string;
  userRole: "business" | "client" | "worker" | "admin";
  onBack: () => void;
  onClose: () => void;
}

export default function ChatThread({
  chatId,
  userId,
  userRole,
  onBack,
  onClose,
}: ChatThreadProps) {
  const { user, role, loading: meLoading } = useMe();
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [newMessageIndicatorVisible, setNewMessageIndicatorVisible] =
    useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const wasAtBottomRef = useRef(true);
  const initialScrollSetRef = useRef(true);
  const previousMessageCountRef = useRef(0);

  const {
    data: chatData,
    loading: chatLoading,
    error: chatError,
    refetch,
  } = useQuery(GET_CHAT_BY_ID, {
    variables: { id: chatId },
    skip: !chatId,
  });

  const [sendMessage] = useMutation(SEND_MESSAGE);
  const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ);

  const chat = chatData?.chat;

  // Handle real-time message updates
  useSubscription(ON_MESSAGE_RECEIVED, {
    variables: { chatId },
    onData: ({ data }) => {
      if (data.data?.messageReceived?.chatId === chatId) {
        refetch();
      }
    },
  });

  // Handle real-time chat updates
  // useSubscription(ON_CHAT_UPDATED, {
  //   variables: { userId },
  //   onData: ({ data }) => {
  //     if (data.data?.chatStatusUpdated?.id === chatId) {
  //       refetch();
  //     }
  //   },
  // });

  // Mark messages as read when opening/visiting a chat
  useEffect(() => {
    // mark messages as read for this user when opening/visiting a chat
    if (!chat?.id || !userId) return;
    try {
      markMessagesAsRead({
        variables: { chatId: chat.id, userId },
        refetchQueries: userId
          ? [{ query: GET_UNREAD_COUNT, variables: { userId } }]
          : [],
        awaitRefetchQueries: false,
      }).catch(() => {
        // ignore errors silently
      });
    } catch (_e) {
      // swallow
    }
  }, [chatId, userId, markMessagesAsRead]);

  const scrollToBottom = (smooth = true) => {
    const root = scrollAreaRef.current;
    const viewport = root?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );

    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    } else {
      messagesEndRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  // Track whether the user is scrolled near the bottom and hide the indicator when they return.
  useEffect(() => {
    const root = scrollAreaRef.current;
    if (!root) return;

    const viewport = root.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    );
    if (!viewport) return;

    const handleScroll = () => {
      const atBottom =
        viewport.scrollHeight - (viewport.scrollTop + viewport.clientHeight) <
        50;
      wasAtBottomRef.current = atBottom;
      if (atBottom) {
        setNewMessageIndicatorVisible(false);
      }
    };

    handleScroll();
    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [chatId]);

  useEffect(() => {
    const messages = chat?.messages;
    if (!messages) return;

    const currentMessageCount = messages.length;
    const lastMessage = messages[currentMessageCount - 1];
    const isNewMessage = currentMessageCount > previousMessageCountRef.current;
    const isOwnMessage = lastMessage?.senderId === userId;
    const shouldAutoScroll =
      initialScrollSetRef.current || wasAtBottomRef.current || isOwnMessage;

    if (initialScrollSetRef.current) {
      scrollToBottom(false);
      initialScrollSetRef.current = false;
      setNewMessageIndicatorVisible(false);
    } else if (isNewMessage) {
      if (shouldAutoScroll) {
        scrollToBottom(true);
        setNewMessageIndicatorVisible(false);
      } else {
        setNewMessageIndicatorVisible(true);
      }
    }

    previousMessageCountRef.current = currentMessageCount;
  }, [chat?.messages, userId]);

  const handleSend = async () => {
    if (!message.trim() || !chatId || isSending) return;

    setIsSending(true);

    try {
      await sendMessage({
        variables: {
          input: {
            chatId,
            content: message,
            senderType:
              userRole === "business"
                ? "BUSINESS"
                : userRole === "worker"
                  ? "WORKER"
                  : "CLIENT",
            senderId: userId,
          },
        },
      });

      setMessage("");
      refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

    // Handle typing indicator
    if (e.key !== "Enter" && !isTyping) {
      setIsTyping(true);
      // Reset typing indicator after 2 seconds of inactivity
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const getParticipantName = () => {
    if (!chat?.participants) return "Unknown";

    if (userRole === "business" || userRole === "worker") {
      const clientPart = chat.participants.find((p: any) => p.client);
      return (
        clientPart?.client?.fullName || clientPart?.client?.username || "Client"
      );
    } else if (userRole === "client") {
      const businessPart = chat.participants.find((p: any) => p.business);
      return businessPart?.business?.name || "Business";
    }

    return "Unknown";
  };

  const getParticipantAvatar = () => {
    if (!chat?.participants) return null;

    if (userRole === "business" || userRole === "worker") {
      const clientPart = chat.participants.find((p: any) => p.client);
      return clientPart?.client?.avatar || null;
    } else if (userRole === "client") {
      const businessPart = chat.participants.find((p: any) => p.business);
      return businessPart?.business?.avatar || null;
    }

    return null;
  };

  const getMessageStatus = (message: any) => {
    if (message.senderId === userId) {
      if (message.isRead) {
        return "read";
        // } else if (message.status === "delivered") {
        //   return "delivered";
        // } else if (message.status === "pending") {
        //   return "pending";
        // } else if (message.status === "error") {
        //   return "error";
      } else {
        return "sent";
      }
    }
    return "sent";
  };

  if (chatLoading || meLoading) {
    return (
      <div className="flex flex-col h-full">
        {/* Header Skeleton */}
        <div className="p-4 border-b border-border flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="flex-1">
            <div className="h-5 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2 mt-1" />
          </div>
          <div className="w-8 h-8 rounded-full bg-muted" />
        </div>

        {/* Messages Skeleton */}
        <ScrollArea className="flex-1 min-h-0 overflow-hidden p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl p-3 ${
                  i % 2 === 0
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted rounded-tl-none"
                }`}
              >
                <div className="h-3 bg-muted rounded w-full" />
                {i % 3 === 0 && (
                  <div className="h-3 bg-muted rounded w-3/4 mt-1" />
                )}
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Input Skeleton */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="h-10 bg-muted rounded-lg" />
          <div className="flex justify-between">
            <div className="w-8 h-8 rounded-full bg-muted" />
            <div className="w-8 h-8 rounded-full bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (chatError) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="ml-3">
            <h2 className="font-semibold">Error</h2>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-medium mb-2">
            Failed to load conversation
          </h3>
          <p className="text-center text-muted-foreground mb-6">
            {chatError.message ||
              "There was an error loading this conversation. Please try again later."}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border flex items-center">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="ml-3">
            <h2 className="font-semibold">Conversation</h2>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Conversation not found</h3>
          <p className="text-center text-muted-foreground mb-6">
            The conversation you're looking for doesn't exist or has been
            deleted.
          </p>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {getParticipantAvatar() ? (
              <img
                src={getParticipantAvatar()}
                alt={getParticipantName()}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                {userRole === "business" ? (
                  <User className="h-5 w-5 text-primary" />
                ) : (
                  <Store className="h-5 w-5 text-primary" />
                )}
              </div>
            )}
            <h2 className="font-semibold truncate">{getParticipantName()}</h2>
          </div>

          <div className="flex items-center gap-1 mt-1">
            {chat.business?.businessType && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                {BusinessTypeIcon({
                  businessType: chat.business.businessType,
                  className: "h-5 w-5 text-primary",
                })}
                {chat.business.businessType === "ARTISAN" && "Artisan"}
                {chat.business.businessType === "BOOKSTORE" && "Bookstore"}
                {chat.business.businessType === "ELECTRONICS" && "Electronics"}
                {chat.business.businessType === "HARDWARE" && "Hardware"}
                {chat.business.businessType === "GROCERY" && "Grocery"}
                {chat.business.businessType === "CAFE" && "Café"}
                {chat.business.businessType === "RESTAURANT" && "Restaurant"}
                {chat.business.businessType === "RETAIL" && "Retail"}
                {chat.business.businessType === "BAR" && "Bar"}
                {chat.business.businessType === "CLOTHING" && "Clothing"}
                {!chat.business.businessType && "Business"}
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

        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea
        className="flex-1 min-h-0 overflow-hidden p-4 space-y-2"
        ref={scrollAreaRef}
      >
        {chat.messages && chat.messages.length > 0 ? (
          <>
            {chat.messages.map((msg: any, index: number) => {
              const isLastInGroup =
                index === chat.messages.length - 1 ||
                chat.messages[index + 1].senderId !== msg.senderId;
              const isFirstInGroup =
                index === 0 ||
                chat.messages[index - 1].senderId !== msg.senderId;

              return (
                <MessageBubble
                  key={msg.id}
                  message={msg.content}
                  senderId={msg.senderId}
                  createdAt={msg.createdAt}
                  status={getMessageStatus(msg)}
                  isLastInGroup={isLastInGroup}
                  isFirstInGroup={isFirstInGroup}
                />
              );
            })}

            {newMessageIndicatorVisible && (
              <div className="sticky bottom-0 z-10 flex justify-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    scrollToBottom(true);
                    setNewMessageIndicatorVisible(false);
                  }}
                  className="rounded-full px-3 py-1.5"
                >
                  New message
                </Button>
              </div>
            )}

            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <MessageCircle className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-none p-3">
                  <div className="flex space-x-1.5">
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No messages yet</h3>
            <p className="text-muted-foreground mb-6">
              Start the conversation by sending a message to{" "}
              {getParticipantName()}
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="relative">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="pr-10 h-11 text-base"
            disabled={isSending}
          />
          <Button
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-accent text-primary-foreground"
            onClick={handleSend}
            disabled={isSending || !message.trim()}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {chat.messages && chat.messages.length > 0 ? (
              <>
                Last message:{" "}
                {format(
                  new Date(chat.messages[chat.messages.length - 1].createdAt),
                  "HH:mm",
                )}
              </>
            ) : (
              "Start a conversation"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

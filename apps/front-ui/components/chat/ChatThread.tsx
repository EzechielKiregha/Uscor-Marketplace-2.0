"use client";
import { useMutation, useSubscription } from "@apollo/client";
import { ArrowLeft } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  GET_UNREAD_COUNT,
  MARK_MESSAGES_AS_READ,
  ON_MESSAGE_RECEIVED,
} from "@/graphql/chat.gql";
import { useRealTimeMessages } from "@/hooks/useRealTimeMessages";
import { Button } from "../ui/button";
import ScrollArea from "../ui/ScrollArea";
import MessageBubble from "./MessageBubble";

interface ChatThreadProps {
  chat: any;
  userId: string;
  userRole: "business" | "client" | "worker" | "admin";
  onSendMessage: (content: string) => Promise<void>;
  loading?: boolean;
  onBack?: () => void;
}

export default function ChatThread({
  chat,
  userId,
  userRole,
  onSendMessage,
  loading,
  onBack,
}: ChatThreadProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ);

  // Real-time message handler (combines GraphQL + Pusher)
  const { handleMessageFromGraphQL } = useRealTimeMessages({
    chatId: chat?.id || null,
    onMessageReceived: (message) => {
      // Update message list with the new message
      console.log(
        "[ChatThread] Message received, updating local state:",
        message.id,
      );
      setLocalMessages((prevMessages) => {
        const exists = prevMessages.some((msg) => msg.id === message.id);
        if (exists) {
          console.log(
            "[ChatThread] ⚠️ Message already exists in local state:",
            message.id,
          );
          return prevMessages;
        }
        return [...prevMessages, message];
      });
    },
    enabled: true,
  });

  // GraphQL real-time subscription
  console.log(
    "[ChatThread] Setting up GraphQL subscription for chat:",
    chat?.id,
  );
  useSubscription(ON_MESSAGE_RECEIVED, {
    variables: { chatId: chat?.id || "" },
    skip: !chat?.id,
    onData: ({ data }) => {
      console.log("[ChatThread] GraphQL subscription data received:", {
        hasChatId: !!chat?.id,
        hasMessage: !!data.data?.messageReceived,
        messageId: data.data?.messageReceived?.id,
      });
      if (data.data?.messageReceived) {
        console.log(
          "[ChatThread] ✓ Processing GraphQL message:",
          data.data.messageReceived.id,
        );
        handleMessageFromGraphQL(data.data.messageReceived);
      } else {
        console.warn("[ChatThread] ✗ No messageReceived in subscription data");
      }
    },
    onError: (error) => {
      console.error("[ChatThread] ✗ GraphQL subscription error:", error);
    },
  });

  // Local state for messages to ensure immediate updates
  const [localMessages, setLocalMessages] = useState<any[]>([]);

  useEffect(() => {
    // Sync local messages with chat prop
    setLocalMessages(Array.isArray(chat?.messages) ? chat.messages : []);
  }, [chat?.id, chat?.messages]); // Reset when chat changes

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
  }, [chat?.id, userId, markMessagesAsRead]);

  useEffect(() => {
    // smooth scroll the scroll area to bottom when messages change
    if (scrollAreaRef.current) {
      // scroll the container to the bottom
      try {
        scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      } catch (_e) {
        // fallback
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    await onSendMessage(message);
    setMessage("");
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading)
    return (
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    );
  if (!chat)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-600">No chat found</p>
      </div>
    );

  return (
    <div className="flex flex-col h-full w-full overflow-x-hidden">
      {/* Chat Header */}
      <div className="border-b border-border p-2 sm:p-3 md:p-4 flex items-center justify-between bg-background sticky top-0 z-10 w-full max-w-full overflow-x-hidden">
        <div className="flex items-center gap-2 sm:gap-3 w-full max-w-full overflow-x-hidden">
          {onBack && (
            <button onClick={onBack} className="md:hidden mr-2">
              <ArrowLeft />
            </button>
          )}
          <div className="flex items-start gap-2 sm:gap-3 w-full max-w-full">
            <img
              src={chat.product?.title || "avatar.png"}
              alt={chat.product?.title}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover shrink-0"
              onError={(event) => {
                event.currentTarget.src = `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(chat.product?.title?.charAt(0) || "C")}`;
              }}
            />
            <div className="min-w-0 flex-1">
              {/* Business name and product title: truncate, reduce size on small screens */}
              <div className="flex items-center gap-2">
                <div className="font-semibold truncate text-sm md:text-base lg:text-lg">
                  {chat.product?.business.name}
                </div>
              </div>
              {/* Description: hide on very small screens, truncate otherwise */}
              {/* <div className="text-xs sm:text-sm text-gray-500 truncate hidden max-w-[60%] lg:max-w-[50%] xs:block sm:block">
                {chat.service?.description || chat.product?.description || ''}
              </div> */}
              <div className="text-orange-600 text-xs sm:text-sm truncate max-w-[60%] md:max-w-[50%]">
                {chat.product?.title}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-400 whitespace-nowrap ml-2">
              {new Date(chat.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      {/* Messages */}
      {/* <div className="flex-1 h-90  w-full max-w-full"> */}
      <ScrollArea
        className="flex-1 h-[68%] bg-card min-h-0 p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4"
        ref={scrollAreaRef}
      >
        {localMessages.map((msg: any) => (
          <div key={msg.id} className="max-w-full wrap-break-word">
            <MessageBubble
              message={msg.content || msg.message}
              senderId={msg.senderId}
              senderType={msg.senderType}
              createdAt={msg.createdAt}
              isCurrentUser={msg.senderId === userId}
              userRole={userRole}
            />
          </div>
        ))}
        <div ref={messagesEndRef} />
      </ScrollArea>
      {/* </div> */}
      {/* Message Input */}
      <div className="border-t border-border p-2 sm:p-3 md:p-4 bg-background sticky bottom-0 z-10 w-full max-w-full overflow-x-hidden">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-2 sm:p-2.5 md:p-3 border border-orange-400/60 dark:border-orange-500/70 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-10 max-h-30 text-sm md:text-base max-w-full overflow-x-hidden"
              rows={1}
              disabled={isSending}
            />
          </div>
          <Button
            className={`shrink-0 text-white mb-1.5 lg:mb-3 md:mb-3 ${!message.trim() || isSending ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!message.trim() || isSending}
            onClick={handleSend}
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
}

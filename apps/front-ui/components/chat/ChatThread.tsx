"use client"
import React, { useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';
import ScrollArea from '../ui/ScrollArea';
import { Button } from '../ui/button';
import Loader from '../seraui/Loader';
import { ArrowLeft } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { MARK_MESSAGES_AS_READ, GET_UNREAD_COUNT } from '@/graphql/chat.gql';

interface ChatThreadProps {
  chat: any;
  userId: string;
  userRole: 'business' | 'client' | 'worker' | 'admin';
  onSendMessage: (content: string) => Promise<void>;
  loading?: boolean;
  onBack?: () => void;
}

export default function ChatThread({ chat, userId, userRole, onSendMessage, loading, onBack }: ChatThreadProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  const [markMessagesAsRead] = useMutation(MARK_MESSAGES_AS_READ);

  useEffect(() => {
    // mark messages as read for this user when opening/visiting a chat
    if (!chat?.id || !userId) return;
    try {
      markMessagesAsRead({
        variables: { chatId: chat.id, userId },
        refetchQueries: userId ? [{ query: GET_UNREAD_COUNT, variables: { userId } }] : [],
        awaitRefetchQueries: false,
      }).catch(() => {
        // ignore errors silently
      });
    } catch (e) {
      // swallow
    }
  }, [chat?.id, userId, markMessagesAsRead]);

  useEffect(() => {
    // smooth scroll the scroll area to bottom when messages change
    if (scrollAreaRef.current) {
      // scroll the container to the bottom
      try {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
      } catch (e) {
        // fallback
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.messages]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    await onSendMessage(message);
    setMessage('');
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return (
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading data...</p>
    </div>
  );
  if (!chat) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-red-600">No chat found</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full w-full overflow-x-hidden">
      {/* Chat Header */}
      <div className="border-b border-border p-2 sm:p-3 md:p-4 flex items-center justify-between bg-background sticky top-0 z-10 w-full max-w-full overflow-x-hidden">
        <div className="flex items-center gap-2 sm:gap-3 w-full max-w-full overflow-x-hidden">
          {onBack && (
            <button onClick={onBack} className="md:hidden mr-2"><ArrowLeft /></button>
          )}
          <div className="flex items-start gap-2 sm:gap-3 w-full max-w-full">
            <img
              src={chat.product?.title || "avatar.png"}
              alt={chat.product?.title}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
              onError={event => {
                event.currentTarget.src = `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(chat.product?.title?.charAt(0) || 'C')}`;
              }}
            />
            <div className="min-w-0 flex-1">
              {/* Business name and product title: truncate, reduce size on small screens */}
              <div className="flex items-center gap-2">
                <div className="font-semibold truncate text-sm md:text-base lg:text-lg">
                  {chat.product?.business.name}
                </div>
                {/* <div className="text-orange-600 text-xs sm:text-sm truncate max-w-[40%] md:max-w-[30%] hidden xs:block sm:block">
                  {chat.product?.title}
                </div> */}
              </div>
              {/* Description: hide on very small screens, truncate otherwise */}
              {/* <div className="text-xs sm:text-sm text-gray-500 truncate hidden max-w-[60%] lg:max-w-[50%] xs:block sm:block">
                {chat.service?.description || chat.product?.description || ''}
              </div> */}
              <div className="text-orange-600 text-xs sm:text-sm truncate max-w-[60%] md:max-w-[50%]">
                {chat.product?.title}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-400 whitespace-nowrap ml-2">{new Date(chat.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
      {/* Messages */}
      {/* <div className="flex-1 h-90  w-full max-w-full"> */}
      <ScrollArea className="flex-1 h-[68%] bg-card min-h-0 p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4" ref={scrollAreaRef}>
        {chat.messages.map((msg: any) => (
          <div key={msg.id} className="max-w-full break-words">
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
              onChange={e => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-2 sm:p-2.5 md:p-3 border border-orange-400/60 dark:border-orange-500/70 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[40px] max-h-[120px] text-sm md:text-base max-w-full overflow-x-hidden"
              rows={1}
              disabled={isSending}
            />
          </div>
          <Button
            className={`flex-shrink-0 text-white mb-1.5 lg:mb-3 md:mb-3 ${!message.trim() || isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!message.trim() || isSending}
            onClick={handleSend}
          >
            {isSending ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}

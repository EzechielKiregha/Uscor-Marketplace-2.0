// app/business/chats/_components/ChatThread.tsx
'use client';

import { use, useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CHAT_BY_ID, SEND_MESSAGE } from '@/graphql/chat.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Smile, X, MoreVertical, ArrowLeft } from 'lucide-react';
import { useMe } from '@/lib/useMe';

interface ChatThreadProps {
  chatId: string;
  onBack?: () => void;
}

export default function ChatThread({ chatId, onBack }: ChatThreadProps) {
  const user = useMe()
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data, loading, error, refetch } = useQuery(GET_CHAT_BY_ID, {
    variables: { id: chatId }
  });
  const [sendMessage] = useMutation(SEND_MESSAGE);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.chat?.messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    try {
      await sendMessage({
        variables: {
          input: {
            chatId,
            content: message,
            senderType: 'BUSINESS',
            senderId: user?.id
          }
        }
      });
      setMessage('');
      refetch();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader loading={true} />
    </div>
  )
  if (error) return <div>Error loading chat</div>;
  if (!data?.chat) return <div>Chat not found</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-border p-3 md:p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden flex-shrink-0"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <img
            src={data.chat.client ? data.chat.client.avatar : "avatar.png"}
            alt={data.chat.client ? data.chat.client.fullName : "avatar.png"}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
            onError={
              (event) => {
                event.currentTarget.src = `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(data.chat.client ? data.chat.client.fullName.charAt(0) : "A")}`;
              }
            }
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-sm md:text-base truncate">{data.chat.client ? data.chat.client.fullName : "Anonymous"}</h2>
            {data.chat.product && (
              <p className="text-xs md:text-sm text-muted-foreground truncate">Product: {data.chat.product.title}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="flex-shrink-0">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {data.chat.messages.map((message: any) => (
          <div
            key={message.id}
            className={`flex ${message.senderType === 'CLIENT' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[85%] md:max-w-[70%] rounded-lg p-2 md:p-3 ${message.senderType === 'CLIENT'
                ? 'bg-card border border-border'
                : 'bg-primary text-primary-foreground'
                }`}
            >
              <p className="text-sm md:text-base break-words">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-3 md:p-4">
        <div className="flex items-end gap-2">
          {/* Hide attachment and emoji buttons on mobile to save space */}
          <Button variant="ghost" size="icon" className="hidden md:flex flex-shrink-0">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex flex-shrink-0">
            <Smile className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-2 md:p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[40px] max-h-[120px] text-sm md:text-base"
              rows={1}
            />
          </div>
          <Button
            size="icon"
            className={`flex-shrink-0 ${message.trim() ? 'bg-primary hover:bg-accent' : ''}`}
            disabled={!message.trim() || isSending}
            onClick={handleSendMessage}
          >
            {isSending ? (
              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
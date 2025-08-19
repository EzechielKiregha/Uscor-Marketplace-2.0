// app/business/chats/_components/ChatThread.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CHAT_BY_ID, SEND_MESSAGE } from '@/graphql/chat.gql';
import Loader from '@/components/seraui/Loader';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Smile, X, MoreVertical } from 'lucide-react';

interface ChatThreadProps {
  chatId: string;
}

export default function ChatThread({ chatId }: ChatThreadProps) {
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
            senderId: 'current-business-id'
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

  if (loading) return <Loader loading={true} />;
  if (error) return <div>Error loading chat</div>;
  if (!data?.chat) return <div>Chat not found</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {data.chat.client.avatar ? (
            <img
              src={data.chat.client.avatar}
              alt={data.chat.client.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">
              {data.chat.client.fullName.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="font-semibold">{data.chat.client.fullName}</h2>
            {data.chat.product && (
              <p className="text-sm text-muted-foreground">Product: {data.chat.product.title}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {data.chat.messages.map((message: any) => (
          <div
            key={message.id}
            className={`flex ${message.senderType === 'CLIENT' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${message.senderType === 'CLIENT'
                ? 'bg-card border border-border'
                : 'bg-primary text-primary-foreground'
                }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Smile className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[40px] max-h-[120px]"
              rows={1}
            />
          </div>
          <Button
            size="icon"
            className={message.trim() ? 'bg-primary hover:bg-accent' : ''}
            disabled={!message.trim() || isSending}
            onClick={handleSendMessage}
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
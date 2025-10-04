import React, { useRef, useEffect, useState } from 'react';
import MessageBubble from './MessageBubble';
import { Button } from '../ui/button';
import Loader from '../seraui/Loader';
import { ArrowLeft } from 'lucide-react';

interface ChatThreadProps {
  chat: any;
  userId: string;
  userRole: 'business' | 'client' | 'worker';
  onSendMessage: (content: string) => Promise<void>;
  loading?: boolean;
  onBack?: () => void;
}

export default function ChatThread({ chat, userId, userRole, onSendMessage, loading, onBack }: ChatThreadProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
  if (!chat) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader loading={true} />
    </div>
  )

  return (
    <div className="flex flex-col h-full min-h-0 max-h-screen w-full overflow-x-hidden">
      {/* Chat Header */}
      <div className="border-b border-border p-2 sm:p-3 md:p-4 flex items-center justify-between bg-background sticky top-0 z-10 w-full max-w-full overflow-x-hidden">
        <div className="flex items-center gap-2 sm:gap-3 w-full max-w-full overflow-x-hidden">
          {onBack && (
            <button onClick={onBack} className="md:hidden mr-2"><ArrowLeft /></button>
          )}
          <div className="flex items-start gap-2 sm:gap-3 w-full max-w-full overflow-x-hidden">
            <img
              src={chat.product?.title || "avatar.png"}
              alt={chat.product?.title}
              className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
              onError={event => {
                event.currentTarget.src = `https://placehold.co/400x300/EA580C/FFFFFF?text=${encodeURIComponent(chat.product?.title?.charAt(0) || 'C')}`;
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate text-sm sm:text-base md:text-lg">{chat.product?.business.name} <span className='text-orange-600 text-xs sm:text-sm'>{chat.product?.title}</span></div>
              <div className="text-xs sm:text-sm text-gray-500 truncate">{chat.service?.description || chat.product?.description || ''}</div>
            </div>
            <div className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">{new Date(chat.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4 bg-card w-full max-w-full overflow-x-hidden">
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
      </div>
      {/* Message Input */}
      <div className="border-t border-border p-2 sm:p-3 md:p-4 bg-background sticky bottom-0 z-10 w-full max-w-full overflow-x-hidden">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full p-2 sm:p-2.5 md:p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[40px] max-h-[120px] text-sm md:text-base max-w-full overflow-x-hidden"
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

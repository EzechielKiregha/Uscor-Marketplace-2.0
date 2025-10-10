import React from 'react';

interface MessageBubbleProps {
  message: string;
  senderId: string;
  senderType?: string;
  createdAt: string | Date;
  isCurrentUser: boolean;
  userRole: 'business' | 'client' | 'worker';
}

export default function MessageBubble({ message, senderId, senderType, createdAt, isCurrentUser }: MessageBubbleProps) {
  const time = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;

  return (
    <div className={`mb-2 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`relative max-w-[85%] break-words px-3 py-2 text-sm leading-relaxed shadow-sm ${isCurrentUser ? 'bg-orange-500 text-white rounded-xl rounded-tr-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl rounded-tl-none'}`}
      >
        {/* Tail */}
        <span
          className={`hidden md:block absolute top-0 ${isCurrentUser ? 'right-0 translate-x-1' : 'left-0 -translate-x-1'}`}
          style={{ width: 12, height: 12, transformOrigin: 'center', marginTop: -6 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d={isCurrentUser ? 'M0 12 L12 0 L12 12 Z' : 'M12 12 L0 0 L0 12 Z'} fill={isCurrentUser ? '#f97316' : '#f3f4f6'} />
          </svg>
        </span>

        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-semibold truncate max-w-[80%]">{senderType || ''}</div>
          <div className="text-[10px] text-gray-300 ml-2">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>

        <div className="mt-1 whitespace-pre-wrap">{message}</div>
      </div>
    </div>
  );
}

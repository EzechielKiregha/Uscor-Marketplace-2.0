import React from 'react';

interface MessageBubbleProps {
  message: string;
  senderId: string;
  senderType?: string;
  createdAt: string | Date;
  isCurrentUser: boolean;
  userRole: 'business' | 'client' | 'worker';
}

export default function MessageBubble({ message, senderId, senderType, createdAt, isCurrentUser, userRole }: MessageBubbleProps) {
  return (
    <div
      className={`mb-2 w-fit max-w-md ${isCurrentUser ? 'ml-auto bg-orange-100 dark:bg-orange-600/80 rounded-l-lg rounded-tr-lg text-right' : 'mr-auto rounded-r-lg rounded-tl-lg bg-gray-100 dark:bg-gray-700'}`}
    >
      <div className="flex items-center space-x-2 p-2">
        <div className="text-xs font-medium">{senderType || ''}</div>
        <div className="text-xs text-gray-400 ">{new Date(createdAt).toLocaleTimeString()}</div>
      </div>
      <div className="p-2">
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}

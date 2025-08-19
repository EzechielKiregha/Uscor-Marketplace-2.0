import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  senderId: string;
  createdAt: Date;
  className?: string;
}

export default function ChatMessage({ message, senderId, createdAt, className }: ChatMessageProps) {
  const isCurrentUser = senderId === 'current-user-id'; // Replace with actual user ID from auth

  return (
    <Card
      className={cn(
        'mb-4 w-fit max-w-md',
        isCurrentUser ? 'ml-auto bg-orange-100 dark:bg-orange-900 text-right' : 'mr-auto bg-gray-100 dark:bg-gray-700',
        className
      )}
    >
      <CardHeader className="p-2 flex-row items-center space-x-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback>{senderId.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-sm font-medium">{senderId}</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <p className="text-sm">{message}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(createdAt).toLocaleTimeString()}</p>
      </CardContent>
    </Card>
  );
}
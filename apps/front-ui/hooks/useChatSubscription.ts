import { useEffect, useCallback } from 'react';
import { getPusherClient } from '@/lib/pusher-client';

interface UseMessageSubscriptionProps {
  chatId: string | null;
  onMessageReceived: (message: any) => void;
  enabled?: boolean; // Allow disabling Pusher subscription
}

/**
 * Custom hook to subscribe to Pusher chat channel
 * Falls back gracefully if Pusher is disabled or not configured
 */
export function useChatSubscription({
  chatId,
  onMessageReceived,
  enabled = true,
}: UseMessageSubscriptionProps) {
  useEffect(() => {
    if (!chatId || !enabled) return;

    try {
      // Only use Pusher if explicitly enabled (can be controlled by env var)
      const usePusher = process.env.NEXT_PUBLIC_USE_PUSHER === 'true';
      if (!usePusher) return;

      const pusher = getPusherClient();
      const channelName = `chat-${chatId}`;
      const channel = pusher.subscribe(channelName);

      // Bind to the message event
      channel.bind('message', (data: any) => {
        onMessageReceived(data);
      });

      // Cleanup function
      return () => {
        channel.unbind('message');
        pusher.unsubscribe(channelName);
      };
    } catch (error) {
      // Silently fail if Pusher is not configured
      // The GraphQL subscription will handle real-time updates
      console.debug('Pusher subscription failed, falling back to GraphQL', error);
    }
  }, [chatId, onMessageReceived, enabled]);
}

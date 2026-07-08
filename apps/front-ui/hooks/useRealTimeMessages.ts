import { MessageDeduplicator } from '@/lib/message-deduplicator';
import { getPusherClient } from '@/lib/pusher-client';
import { useCallback, useEffect, useRef } from 'react';

interface Message {
  id: string;
  content?: string;
  message?: string;
  senderId: string;
  senderType?: string;
  createdAt: string;
}

interface UseRealTimeMessagesProps {
  chatId: string | null;
  onMessageReceived: (message: Message) => void;
  enabled?: boolean;
}

/**
 * Enhanced hook for real-time message updates
 * Combines GraphQL subscriptions + Pusher for redundancy
 * Automatically de-duplicates messages from multiple sources
 */
export function useRealTimeMessages({
  chatId,
  onMessageReceived,
  enabled = true,
}: UseRealTimeMessagesProps) {
  const deduplicatorRef = useRef<MessageDeduplicator | null>(null);
  const pusherChannelRef = useRef<any>(null);

  // Initialize deduplicator on mount
  useEffect(() => {
    deduplicatorRef.current = new MessageDeduplicator(30000); // 30s TTL

    return () => {
      deduplicatorRef.current?.destroy();
    };
  }, []);

  // Handle message from any source (GraphQL, Pusher, or optimistic)
  const handleMessageUpdate = useCallback(
    (message: Message, source: 'graphql' | 'pusher' | 'optimistic') => {
      console.log(`[Real-Time] ${source.toUpperCase()} message received:`, {
        messageId: message?.id,
        senderId: message?.senderId,
        content: message?.content || message?.message,
        source,
      });

      if (!message?.id || !deduplicatorRef.current) {
        console.warn(`[Real-Time] ✗ Invalid message or deduplicator:`, {
          hasId: !!message?.id,
          hasDeduplicator: !!deduplicatorRef.current,
        });
        return;
      }

      // Check for duplicates
      const duplicate = deduplicatorRef.current.isDuplicate(message.id);
      
      if (duplicate) {
        console.debug(
          `[Real-Time] ⚠️  Duplicate message ${message.id} (already processed from ${duplicate.type}), ignoring`
        );
        return;
      }

      // Mark as processed
      deduplicatorRef.current.markProcessed(message.id, source);
      console.log(`[Real-Time] ✓ Marked as processed from ${source}`);

      // Normalize message format
      const normalizedMessage: Message = {
        id: message.id,
        content: message.content || message.message,
        message: message.message || message.content,
        senderId: message.senderId,
        senderType: message.senderType,
        createdAt: message.createdAt,
      };

      console.log(`[Real-Time] ✓ Processing message from ${source.toUpperCase()}:`, normalizedMessage);
      onMessageReceived(normalizedMessage);
    },
    [onMessageReceived]
  );

  // Pusher subscription
  useEffect(() => {
    if (!chatId || !enabled) {
      console.log('[Real-Time] Pusher subscription skipped:', {
        hasChatId: !!chatId,
        enabled,
      });
      return;
    }

    try {
      const usePusher = process.env.NEXT_PUBLIC_USE_PUSHER === 'true';
      console.log('[Real-Time] Checking Pusher config:', {
        NEXT_PUBLIC_USE_PUSHER: process.env.NEXT_PUBLIC_USE_PUSHER,
        usePusherEnabled: usePusher,
      });

      if (!usePusher) {
        console.log('[Real-Time] ⚠️  Pusher disabled via NEXT_PUBLIC_USE_PUSHER=false');
        return;
      }

      console.log('[Real-Time] Attempting to subscribe to Pusher for chat:', chatId);
      const pusher = getPusherClient();
      const channelName = `chat-${chatId}`;
      const channel = pusher.subscribe(channelName);

      pusherChannelRef.current = channel;

      console.log('[Real-Time] Channel subscription initiated:', channelName);

      // Bind to message event
      channel.bind('message', (data: any) => {
        console.log('[Real-Time] Pusher event received on channel:', channelName);
        handleMessageUpdate(data, 'pusher');
      });

      channel.bind('pusher:subscription_succeeded', () => {
        console.log('[Real-Time] ✓ Successfully subscribed to channel:', channelName);
      });

      channel.bind('pusher:subscription_error', (error: any) => {
        console.error('[Real-Time] ✗ Subscription error on channel:', channelName, error);
      });

      console.log(`[Real-Time] ✓ Pusher subscribed to channel: ${channelName}`);

      // Cleanup
      return () => {
        console.log('[Real-Time] Cleaning up Pusher subscription:', channelName);
        channel.unbind('message');
        channel.unbind('pusher:subscription_succeeded');
        channel.unbind('pusher:subscription_error');
        pusher.unsubscribe(channelName);
        pusherChannelRef.current = null;
        console.log(`[Real-Time] ✓ Unsubscribed from channel: ${channelName}`);
      };
    } catch (error) {
      console.error('[Real-Time] ✗ Pusher subscription failed (non-critical):', error);
      console.log('[Real-Time] ℹ️  Falling back to GraphQL subscriptions');
      // Graceful fallback - GraphQL subscriptions will still work
    }
  }, [chatId, enabled, handleMessageUpdate]);

  // Export message handler for GraphQL subscription use
  return {
    handleMessageFromGraphQL: (message: Message) =>
      handleMessageUpdate(message, 'graphql'),
    handleOptimisticUpdate: (message: Message) =>
      handleMessageUpdate(message, 'optimistic'),
  };
}
